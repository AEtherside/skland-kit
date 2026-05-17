import type { FetchContext } from 'ofetch'
import type { Storage } from 'unstorage'
import { SERVER_TIMESTAMP_OFFSET, STORAGE_CREDENTIAL_KEY, STORAGE_OAUTH_TOKEN_KEY } from '../constants'
import { assert } from './assert'
import { hmacSha256, md5 } from './crypto'
import { getDid } from './env'

function parseURL(ctx: FetchContext): URL {
  const url = typeof ctx.request === 'string' ? ctx.request : ctx.request.url
  if (URL.canParse(url))
    return new URL(url)
  return new URL(url, ctx.options.baseURL)
}

export async function signRequest(ctx: FetchContext, storage: Storage<string>): Promise<void> {
  const token = await storage.get(STORAGE_OAUTH_TOKEN_KEY)
  const cred = await storage.get(STORAGE_CREDENTIAL_KEY)

  assert(cred, '【skland-kit】森空岛 cred 未获取')
  assert(token, '【skland-kit】森空岛 token 未设置')

  const parsedURL = parseURL(ctx)
  const headers = new Headers(ctx.options.headers)

  if (!headers.has('user-agent'))
    headers.set('user-agent', 'Mozilla/5.0 (Linux; Android 12; SM-A5560 Build/V417IR; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/101.0.4951.61 Safari/537.36; SKLand/1.52.1')
  if (!headers.has('accept-encoding'))
    headers.set('accept-encoding', 'gzip')
  if (!headers.has('connection'))
    headers.set('connection', 'close')
  if (!headers.has('x-requested-with'))
    headers.set('x-requested-with', 'com.hypergryph.skland')

  const query = new URLSearchParams(ctx.options.query ?? {}).toString()

  const timestamp = (Date.now() - SERVER_TIMESTAMP_OFFSET).toString().slice(0, -3)

  const signatureHeaders = {
    platform: '3',
    timestamp,
    dId: await getDid(storage),
    vName: '1.0.0',
  }

  const str = `${parsedURL.pathname}${query}${ctx.options.body ? JSON.stringify(ctx.options.body) : ''}${timestamp}${JSON.stringify(signatureHeaders)}`

  const signature = md5(hmacSha256(token, str))

  Object.entries(signatureHeaders).forEach(([key, value]) => {
    headers.set(key, value)
  })
  headers.set('sign', signature)
  headers.set('cred', cred)

  ctx.options.headers = headers
}
