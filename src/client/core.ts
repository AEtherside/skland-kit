import type { Client, ClientConfig, SklandResponse } from '../types'
import { defu } from 'defu'
import { createFetch } from 'ofetch'
import { createStorage } from 'unstorage'
import { STORAGE_CREDENTIAL_KEY, STORAGE_OAUTH_TOKEN_KEY, STORAGE_USER_ID_KEY } from '../constants'
import { assert } from '../utils/assert'
import { getDid } from '../utils/env'
import { signRequest } from '../utils/signature'
import { buildCollections } from './collections'
import { clientCtx } from './ctx'

export function createClient(config: ClientConfig = {}): Client {
  const { baseURL, timeout, driver } = defu<ClientConfig, [{ baseURL: string, timeout: number }]>(config, {
    baseURL: 'https://zonai.skland.com',
    timeout: 30 * 1000,
  })

  const storage = createStorage<string>(driver ? { driver } : undefined)

  const $fetch = createFetch({
    defaults: {
      baseURL,
      timeout,
    },
  })

  async function signIn(authorizeCode: string) {
    const did = await getDid(storage)
    const data = await $fetch<SklandResponse<{ cred: string, userId: string, token: string }>>(
      '/web/v1/user/auth/generate_cred_by_code',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
          'referer': 'https://www.skland.com/',
          'origin': 'https://www.skland.com',
          'dId': did,
          'platform': '3',
          'timestamp': `${Math.floor(Date.now() / 1000)}`,
          'vName': '1.0.0',
        },
        body: {
          code: authorizeCode,
          kind: 1,
        },
      },
    ).then(res => res.data)

    await storage.setItems([
      { key: STORAGE_OAUTH_TOKEN_KEY, value: data.token },
      { key: STORAGE_CREDENTIAL_KEY, value: data.cred },
      { key: STORAGE_USER_ID_KEY, value: data.userId },
    ])

    return data
  }

  async function refresh() {
    const cred = await storage.getItem(STORAGE_CREDENTIAL_KEY)
    assert(cred, '【skland-kit】cred 未获取')

    const data = await $fetch<SklandResponse<{ token: string }>>(
      `/web/v1/auth/refresh`,
      {
        headers: {
          'content-type': 'application/json',
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
          'referer': 'https://www.skland.com/',
          'origin': 'https://www.skland.com',
        },
        onRequest: ctx => signRequest(ctx, storage),
      },
    )

    await storage.setItems([
      { key: STORAGE_OAUTH_TOKEN_KEY, value: data.data.token },
    ])

    return data.data
  }

  const collections = clientCtx.call({ storage, $fetch }, buildCollections)

  const client = Object.freeze({
    $fetch,
    storage,
    signIn,
    refresh,
    collections,
  })

  return client
}
