import type { Storage } from 'unstorage'
import { format } from 'date-fns'
import { STORAGE_DID_KEY } from '../constants'
import { encryptAES, encryptObjectByDESRules, encryptRSA, md5 } from './crypto'

/**
 * 数美科技配置
 * `window._smConf`
 */
export const SKLAND_SM_CONFIG = {
  organization: 'UWXspnCCJN4sfYlNfqps',
  appId: 'default',
  publicKey: 'MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCmxMNr7n8ZeT0tE1R9j/mPixoinPkeM+k4VGIn/s0k7N5rJAfnZ0eMER+QhwFvshzo0LNmeUkpR8uIlU/GEVr8mN28sKmwd2gpygqj0ePnBmOW4v0ZVwbSYK+izkhVFk2V/doLoMbWy6b+UnA8mkjvg0iYWRByfRsK2gdl7llqCwIDAQAB',
  protocol: 'https',
  apiHost: 'fp-it.portal101.cn',
  apiPath: '/deviceprofile/v4',
}

interface DESRule {
  cipher?: string
  is_encrypt: number
  key?: string
  obfuscated_name: string
}

const DES_RULE: Record<string, DESRule> = {
  appId: {
    cipher: 'DES',
    is_encrypt: 1,
    key: 'uy7mzc4h',
    obfuscated_name: 'xx',
  },
  box: {
    is_encrypt: 0,
    obfuscated_name: 'jf',
  },
  canvas: {
    cipher: 'DES',
    is_encrypt: 1,
    key: 'snrn887t',
    obfuscated_name: 'yk',
  },
  clientSize: {
    cipher: 'DES',
    is_encrypt: 1,
    key: 'cpmjjgsu',
    obfuscated_name: 'zx',
  },
  organization: {
    cipher: 'DES',
    is_encrypt: 1,
    key: '78moqjfc',
    obfuscated_name: 'dp',
  },
  os: {
    cipher: 'DES',
    is_encrypt: 1,
    key: 'je6vk6t4',
    obfuscated_name: 'pj',
  },
  platform: {
    cipher: 'DES',
    is_encrypt: 1,
    key: 'pakxhcd2',
    obfuscated_name: 'gm',
  },
  plugins: {
    cipher: 'DES',
    is_encrypt: 1,
    key: 'v51m3pzl',
    obfuscated_name: 'kq',
  },
  pmf: {
    cipher: 'DES',
    is_encrypt: 1,
    key: '2mdeslu3',
    obfuscated_name: 'vw',
  },
  protocol: {
    is_encrypt: 0,
    obfuscated_name: 'protocol',
  },
  referer: {
    cipher: 'DES',
    is_encrypt: 1,
    key: 'y7bmrjlc',
    obfuscated_name: 'ab',
  },
  res: {
    cipher: 'DES',
    is_encrypt: 1,
    key: 'whxqm2a7',
    obfuscated_name: 'hf',
  },
  rtype: {
    cipher: 'DES',
    is_encrypt: 1,
    key: 'x8o2h2bl',
    obfuscated_name: 'lo',
  },
  sdkver: {
    cipher: 'DES',
    is_encrypt: 1,
    key: '9q3dcxp2',
    obfuscated_name: 'sc',
  },
  status: {
    cipher: 'DES',
    is_encrypt: 1,
    key: '2jbrxxw4',
    obfuscated_name: 'an',
  },
  subVersion: {
    cipher: 'DES',
    is_encrypt: 1,
    key: 'eo3i2puh',
    obfuscated_name: 'ns',
  },
  svm: {
    cipher: 'DES',
    is_encrypt: 1,
    key: 'fzj3kaeh',
    obfuscated_name: 'qr',
  },
  time: {
    cipher: 'DES',
    is_encrypt: 1,
    key: 'q2t3odsk',
    obfuscated_name: 'nb',
  },
  timezone: {
    cipher: 'DES',
    is_encrypt: 1,
    key: '1uv05lj5',
    obfuscated_name: 'as',
  },
  tn: {
    cipher: 'DES',
    is_encrypt: 1,
    key: 'x9nzj1bp',
    obfuscated_name: 'py',
  },
  trees: {
    cipher: 'DES',
    is_encrypt: 1,
    key: 'acfs0xo4',
    obfuscated_name: 'pi',
  },
  ua: {
    cipher: 'DES',
    is_encrypt: 1,
    key: 'k92crp1t',
    obfuscated_name: 'bj',
  },
  url: {
    cipher: 'DES',
    is_encrypt: 1,
    key: 'y95hjkoo',
    obfuscated_name: 'cf',
  },
  version: {
    is_encrypt: 0,
    obfuscated_name: 'version',
  },
  vpw: {
    cipher: 'DES',
    is_encrypt: 1,
    key: 'r9924ab5',
    obfuscated_name: 'ca',
  },
}

const BROWSER_ENV = {
  plugins: 'MicrosoftEdgePDFPluginPortableDocumentFormatinternal-pdf-viewer1,MicrosoftEdgePDFViewermhjfbmdgcfjbbpaeojofohoefgiehjai1',
  ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36 Edg/129.0.0.0',
  canvas: '259ffe69', // 基于浏览器的canvas获得的值，不知道复用行不行
  timezone: -480, // 时区，应该是固定值吧
  platform: 'Win32',
  url: 'https://www.skland.com/', // 固定值
  referer: '',
  res: '1920_1080_24_1.25', // 屏幕宽度_高度_色深_window.devicePixelRatio
  clientSize: '0_0_1080_1920_1920_1080_1920_1080',
  status: '0011', // 不知道在干啥
}

export const sign_header = {
  platform: '2',
  timestamp: '',
  dId: '',
  vName: '1.21.0',
}

const JSON_COLON_RE = /":"/g
const JSON_COMMA_RE = /","/g
const stringify = (obj: any) => JSON.stringify(obj).replace(JSON_COLON_RE, '": "').replace(JSON_COMMA_RE, '", "')

export async function gzipObject(o: object): Promise<string> {
  // 将对象转换为字节数组
  const encoded = new TextEncoder().encode(stringify(o))

  // 使用 CompressionStream 进行 gzip 压缩
  const compressed = await new Response(
    new Blob([encoded]).stream().pipeThrough<Uint8Array>(new CompressionStream('gzip')),
  ).arrayBuffer()

  // 转换为 Uint8Array 并设置 Python gzip OS FLG
  const compressedArray = new Uint8Array(compressed)
  compressedArray[9] = 19 // Python gzip OS FLG = Unknown

  // 转换为 base64
  return btoa(String.fromCharCode(...compressedArray))
}

export async function getSmId(): Promise<string> {
  const now = new Date()
  const _time = format(now, 'yyyyMMddHHmmss')

  // 生成UUID v4
  const uid = crypto.randomUUID()

  // MD5加密uid
  const uidMd5 = md5(uid)

  const v = `${_time + uidMd5}00`

  // 计算smsk_web
  const smsk_web = md5(`smsk_web_${v}`).substring(0, 14)

  return `${v + smsk_web}0`
}

export function getTn(o: Record<string, any>): string {
  // 获取并排序对象的所有键
  const sortedKeys: string[] = Object.keys(o).sort()

  // 用于存储处理后的值
  const resultList: string[] = []

  // 遍历排序后的键
  for (const key of sortedKeys) {
    let v: any = o[key]

    // 处理数字类型
    if (typeof v === 'number')
      v = String(v * 10000)

    // 处理对象类型（递归）
    else if (typeof v === 'object' && v !== null)
      v = getTn(v)

    resultList.push(v)
  }

  // 将所有结果连接成字符串
  return resultList.join('')
}

const SM_CONFIG = SKLAND_SM_CONFIG
const devices_info_url = `${SKLAND_SM_CONFIG.protocol}://${SKLAND_SM_CONFIG.apiHost}${SKLAND_SM_CONFIG.apiPath}`

export async function getDid(storage: Storage<string>): Promise<string> {
  if (await storage.hasItem(STORAGE_DID_KEY)) {
    const did = await storage.getItem(STORAGE_DID_KEY)
    if (did)
      return did
  }

  // 生成 UUID 并计算 priId
  const uid = crypto.randomUUID()
  const priId = md5(uid).substring(0, 16)

  const ep = await encryptRSA(uid, SM_CONFIG.publicKey)

  // 准备浏览器环境数据
  const browser = {
    ...BROWSER_ENV,
    vpw: crypto.randomUUID(),
    svm: Date.now(),
    trees: crypto.randomUUID(),
    pmf: Date.now(),
  }

  // 准备加密目标数据
  const desTarget: Record<string, string | number> = {
    ...browser,
    protocol: 102,
    organization: SM_CONFIG.organization,
    appId: SM_CONFIG.appId,
    os: 'web',
    version: '3.0.0',
    sdkver: '3.0.0',
    box: '', // 首次请求为空
    rtype: 'all',
    smid: await getSmId(),
    subVersion: '1.0.0',
    time: 0,
  }

  // 计算并添加 tn
  desTarget.tn = md5(getTn(desTarget))

  // DES 加密
  const desResult = await encryptObjectByDESRules(desTarget, DES_RULE)

  // GZIP 压缩
  const gzipResult = await gzipObject(desResult)

  // AES 加密
  const aesResult = await encryptAES(gzipResult, priId)

  const body = {
    appId: 'default',
    compress: 2,
    data: aesResult,
    encode: 5,
    ep,
    organization: SM_CONFIG.organization,
    os: 'web',
  }

  // 发送请求
  const response = await fetch(devices_info_url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const resp = await response.json()

  if (resp.code !== 1100) {
    throw new Error('did计算失败，请联系作者')
  }

  const did = `B${resp.detail.deviceId}`
  await storage.setItem(STORAGE_DID_KEY, did)

  return did
}
