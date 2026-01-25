import type { FetchContext } from 'ofetch'
import type { Storage } from 'unstorage'
import { SERVER_TIMESTAMP_OFFSET, STORAGE_CREDENTIAL_KEY, STORAGE_DID_KEY, STORAGE_OAUTH_TOKEN_KEY } from '../constants'
import { assert } from './assert'
import { hmacSha256, md5 } from './crypto'

function parseURL(ctx: FetchContext): URL {
  const url = typeof ctx.request === 'string' ? ctx.request : ctx.request.url
  if (URL.canParse(url))
    return new URL(url)
  return new URL(url, ctx.options.baseURL)
}

export async function signRequest(
  ctx: FetchContext,
  storage: Storage<string>,
  customHeaders?: Record<string, string>,
): Promise<void> {
  const token = await storage.get(STORAGE_OAUTH_TOKEN_KEY)
  const cred = await storage.get(STORAGE_CREDENTIAL_KEY)
  const did = await storage.get(STORAGE_DID_KEY)

  assert(cred, '【skland-kit】森空岛 cred 未获取')
  assert(token, '【skland-kit】森空岛 token 未设置')

  const parsedURL = parseURL(ctx)
  const headers = new Headers(ctx.options.headers)

  const query = new URLSearchParams(ctx.options.query ?? {}).toString()

  const timestamp = (Date.now() - SERVER_TIMESTAMP_OFFSET).toString().slice(0, -3)

  // 用于签名计算的 headers 对象（不包括自定义 headers）
  const signatureHeaders: Record<string, string> = {
    platform: '1',
    timestamp,
    dId: did || '',
    vName: '1.21.0',
  }

  // 注意：customHeaders (如 sk-game-role) 不参与签名计算，只作为 HTTP headers 发送

  const str = `${parsedURL.pathname}${query}${ctx.options.body ? JSON.stringify(ctx.options.body) : ''}${timestamp}${JSON.stringify(signatureHeaders)}`

  const signature = await md5(await hmacSha256(token, str))

  // 设置实际的 HTTP headers
  headers.append('platform', '1')
  headers.append('timestamp', timestamp)
  headers.append('dId', did || '')
  headers.append('vName', '1.21.0')

  // 添加自定义 headers 到 HTTP 请求（不参与签名）
  if (customHeaders) {
    for (const [key, value] of Object.entries(customHeaders)) {
      headers.append(key, value)
    }
  }

  headers.append('sign', signature)
  headers.append('cred', cred)

  ctx.options.headers = headers
}
