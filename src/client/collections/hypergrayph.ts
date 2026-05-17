import type { FetchOptions } from 'ofetch'
import type { HypergrayphonResponse, HypergrayphonSuccessResponse, Hypergryph } from '../../types'
import defu from 'defu'
import { SKLAND_APP_CODE } from '../../constants'
import { getDid } from '../../utils/env'
import { useClientContext } from '../ctx'

function isSuccessResponse(res: HypergrayphonResponse): res is HypergrayphonSuccessResponse {
  if (
    typeof res.data === 'undefined'
    || typeof res.status === 'undefined'
    || typeof res.type === 'undefined'
  ) {
    return false
  }

  if (res.msg !== 'OK' || res.status !== 0)
    return false

  return true
}

function parseOAuthToken(input: string): string {
  const token = input.trim()

  try {
    const parsed = JSON.parse(token)
    if (typeof parsed?.data?.content === 'string')
      return parsed.data.content
  }
  catch {}

  return token
}

export function buildHypergryphCollection(): Hypergryph {
  const { $fetch, storage } = useClientContext()
  const $fetchHypergryph = $fetch.create({
    baseURL: 'https://as.hypergryph.com',
  })

  // Helper function to handle Hypergryph API requests with unified error handling
  async function fetchHypergryph<T = any>(
    url: string,
    options: FetchOptions<'json'>,
    errorMessage: string,
  ): Promise<HypergrayphonSuccessResponse<T>> {
    const headers = new Headers(options.headers)
    headers.set('user-agent', 'Mozilla/5.0 (Linux; Android 12; SM-A5560 Build/V417IR; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/101.0.4951.61 Safari/537.36; SKLand/1.52.1')
    headers.set('dId', await getDid(storage))
    headers.set('x-requested-with', 'com.hypergryph.skland')

    const res = await $fetchHypergryph<HypergrayphonResponse<T>>(url, {
      ...options,
      headers,
      onResponseError(ctx) {
        throw new Error(`【skland-kit】${errorMessage}`, { cause: ctx.response._data })
      },
    })
    if (!isSuccessResponse(res)) {
      throw new Error(`【skland-kit】${errorMessage}`, { cause: res })
    }

    return res
  }

  return {
    async sendPhoneCode(phone: string) {
      await fetchHypergryph(
        '/general/v1/send_phone_code',
        { method: 'POST', body: { phone, type: 2 } },
        '发送手机验证码错误',
      )
    },
    async generateScanLoginUrl() {
      const res = await fetchHypergryph<{ scanId: string, scanUrl: string }>(
        '/general/v1/gen_scan/login',
        { method: 'POST', body: { appCode: SKLAND_APP_CODE } },
        '生成扫码登录 URL 错误',
      )
      return res.data
    },
    async getScanStatus(scanId: string) {
      const res = await fetchHypergryph<{ scanCode: string, scanStatus: string }>(
        '/general/v1/scan_status',
        { query: { scanId } },
        '获取扫码登录状态错误',
      )
      return res.data
    },
    async getOAuthTokenByPhonePassword(data: { phone: string, password: string }) {
      const res = await fetchHypergryph<{ token: string }>(
        '/user/auth/v1/token_by_phone_password',
        { method: 'POST', body: data },
        '通过手机号和密码获取鹰角 OAuth token 错误',
      )
      return res.data.token
    },
    async getOAuthTokenByPhoneCode(data: { phone: string, code: string }) {
      const res = await fetchHypergryph<{ token: string }>(
        '/user/auth/v2/token_by_phone_code',
        { method: 'POST', body: data },
        '通过手机号和验证码获取鹰角 OAuth token 错误',
      )
      return res.data.token
    },
    async getOAuthTokenByScanCode(scanCode: string) {
      const res = await fetchHypergryph<{ token: string }>(
        '/user/auth/v1/token_by_scan_code',
        { method: 'POST', body: { scanCode } },
        '通过扫码获取鹰角 OAuth token 错误',
      )
      return res.data.token
    },
    async grantAuthorizeCode(token: string, options?: { appCode?: string, type?: number }) {
      const { appCode, type } = defu(options, { appCode: SKLAND_APP_CODE, type: 0 })

      const res = await fetchHypergryph<{ code: string, uid: string }>(
        '/user/oauth2/v2/grant',
        { method: 'POST', body: { appCode, token: parseOAuthToken(token), type } },
        '通过 OAuth 登录凭证验证鹰角网络通行证错误',
      )

      return res.data
    },
  }
}
