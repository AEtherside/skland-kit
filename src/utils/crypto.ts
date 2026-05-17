import * as mima from 'mima-kit'

const PEM_PUBLIC_KEY_HEADER_RE = /-----BEGIN PUBLIC KEY-----/
const PEM_PUBLIC_KEY_FOOTER_RE = /-----END PUBLIC KEY-----/
const WHITESPACE_RE = /\s/g
const BASE64URL_DASH_RE = /-/g
const BASE64URL_UNDERSCORE_RE = /_/g
const MD5_SHIFT = [
  7,
  12,
  17,
  22,
  7,
  12,
  17,
  22,
  7,
  12,
  17,
  22,
  7,
  12,
  17,
  22,
  5,
  9,
  14,
  20,
  5,
  9,
  14,
  20,
  5,
  9,
  14,
  20,
  5,
  9,
  14,
  20,
  4,
  11,
  16,
  23,
  4,
  11,
  16,
  23,
  4,
  11,
  16,
  23,
  4,
  11,
  16,
  23,
  6,
  10,
  15,
  21,
  6,
  10,
  15,
  21,
  6,
  10,
  15,
  21,
  6,
  10,
  15,
  21,
]
const MD5_K = Array.from({ length: 64 }, (_, i) => Math.floor(Math.abs(Math.sin(i + 1)) * 2 ** 32) >>> 0)

function rotateLeft(value: number, shift: number): number {
  return (value << shift) | (value >>> (32 - shift))
}

function toHexWord(value: number): string {
  return [0, 8, 16, 24]
    .map(shift => ((value >>> shift) & 0xFF).toString(16).padStart(2, '0'))
    .join('')
}

export function md5(string: string): string {
  const bytes = new TextEncoder().encode(String(string))
  const padded = new Uint8Array(((bytes.length + 9 + 63) >>> 6) << 6)
  padded.set(bytes)
  padded[bytes.length] = 0x80

  const bitLength = BigInt(bytes.length) * 8n
  for (let i = 0; i < 8; i++) {
    padded[padded.length - 8 + i] = Number((bitLength >> BigInt(8 * i)) & 0xFFn)
  }

  let a0 = 0x67452301
  let b0 = 0xEFCDAB89
  let c0 = 0x98BADCFE
  let d0 = 0x10325476

  for (let offset = 0; offset < padded.length; offset += 64) {
    const words = new Uint32Array(16)
    for (let i = 0; i < 16; i++) {
      const index = offset + i * 4
      words[i] = padded[index] | (padded[index + 1] << 8) | (padded[index + 2] << 16) | (padded[index + 3] << 24)
    }

    let a = a0
    let b = b0
    let c = c0
    let d = d0

    for (let i = 0; i < 64; i++) {
      let f: number
      let g: number

      if (i < 16) {
        f = (b & c) | (~b & d)
        g = i
      }
      else if (i < 32) {
        f = (d & b) | (~d & c)
        g = (5 * i + 1) % 16
      }
      else if (i < 48) {
        f = b ^ c ^ d
        g = (3 * i + 5) % 16
      }
      else {
        f = c ^ (b | ~d)
        g = (7 * i) % 16
      }

      const next = d
      d = c
      c = b
      b = (b + rotateLeft((a + f + MD5_K[i] + words[g]) >>> 0, MD5_SHIFT[i])) >>> 0
      a = next
    }

    a0 = (a0 + a) >>> 0
    b0 = (b0 + b) >>> 0
    c0 = (c0 + c) >>> 0
    d0 = (d0 + d) >>> 0
  }

  return [a0, b0, c0, d0].map(toHexWord).join('')
}

export function hmacSha256(key: string, data: string): string {
  const hmac256 = mima.hmac(mima.sha256)
  return hmac256(mima.UTF8(String(key)), mima.UTF8(data)).to(mima.HEX)
}

/**
 * AES CBC 加密
 */
export async function encryptAES(message: string, key: string): Promise<string> {
  const iv = new TextEncoder().encode('0102030405060708')

  const data = new TextEncoder().encode(message)

  // 导入密钥
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(key),
    { name: 'AES-CBC' },
    false,
    ['encrypt'],
  )

  // 加密
  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-CBC',
      iv,
    },
    cryptoKey,
    data,
  )

  // 转换为十六进制字符串
  return mima.HEX(new Uint8Array(encrypted))
}

function padData(data: string): string {
  const blockSize = 8
  const padLength = blockSize - (data.length % blockSize)
  return data + '\0'.repeat(padLength)
}

/**
 * DES ECB 加密
 */
export async function encryptDES(message: string | number, key: string): Promise<string> {
  const inputStr = padData(String(message))
  // @ts-expect-error 3DES 64 位密钥长度
  const TripleDES = mima.t_des(64)

  const ECBTripleDES = mima.ecb(TripleDES, mima.NO_PAD)
  const cipher = ECBTripleDES(mima.UTF8(key))

  return cipher.encrypt(mima.UTF8(inputStr)).to(mima.B64)
}

export interface DESRule {
  cipher?: string
  is_encrypt: number
  key?: string
  obfuscated_name: string
}

export async function encryptObjectByDESRules(object: Record<string, string | number>, rules: Record<string, DESRule>): Promise<Record<string, string | number>> {
  const result: Record<string, string | number> = {}

  for (const i in object) {
    if (i in rules) {
      const rule = rules[i]
      if (rule.is_encrypt === 1)
        result[rule.obfuscated_name] = await encryptDES(object[i], rule.key!)
      else
        result[rule.obfuscated_name] = object[i]
    }
    else {
      result[i] = object[i]
    }
  }

  return result
}

/**
 * 从PEM格式的公钥中提取RSA参数的n和e (BigInt形式)
 */
export async function extractJWKFromPEM(publicKeyPEM: string): Promise<{ n: bigint, e: bigint }> {
  // 移除PEM头尾和换行，并进行base64解码
  const pemContents = publicKeyPEM
    .replace(PEM_PUBLIC_KEY_HEADER_RE, '')
    .replace(PEM_PUBLIC_KEY_FOOTER_RE, '')
    .replace(WHITESPACE_RE, '')

  const binaryDer = atob(pemContents)
  const derBuffer = new Uint8Array(binaryDer.length)
  for (let i = 0; i < binaryDer.length; i++) {
    derBuffer[i] = binaryDer.charCodeAt(i)
  }

  // 使用 Web Crypto API 导入密钥
  const cryptoKey = await crypto.subtle.importKey(
    'spki',
    derBuffer,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    true,
    ['encrypt'],
  )

  // 导出为JWK格式
  const jwk = await crypto.subtle.exportKey('jwk', cryptoKey)

  return {
    n: base64URLToBigInt(jwk.n!),
    e: base64URLToBigInt(jwk.e!),
  }
}

export function base64URLToBigInt(base64url: string): bigint {
  // 1. Base64URL 转 Base64
  const base64 = base64url
    .replace(BASE64URL_DASH_RE, '+')
    .replace(BASE64URL_UNDERSCORE_RE, '/')
    .padEnd(Math.ceil(base64url.length / 4) * 4, '=')

  // 2. Base64 解码为二进制字符串
  const binaryStr = atob(base64)

  // 3. 转换为 BigInt
  let result = 0n
  for (let i = 0; i < binaryStr.length; i++) {
    result = (result << 8n) | BigInt(binaryStr.charCodeAt(i))
  }

  return result
}

export async function encryptRSA(message: string, publicKey: string): Promise<string> {
  const { n, e } = await extractJWKFromPEM(publicKey)
  const key = mima.rsa({ n, e })
  const cliper = mima.pkcs1_es_1_5(key)

  const encrypted = cliper.encrypt(mima.UTF8(message)).to(mima.B64)

  return encrypted
}
