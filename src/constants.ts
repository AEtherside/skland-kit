/**
 * 森空岛签名时间向前偏移，规避服务端时间校验过严导致的误判。
 */
export const SERVER_TIMESTAMP_OFFSET = 2 * 1000

export const SKLAND_APP_CODE = '4ca99fa6b56cc2ba'

/**
 * 森空岛访问 token
 * @description 没下面的重要，会过期，类似 `accessToken`
 */
export const STORAGE_OAUTH_TOKEN_KEY = 'skland:token'

/**
 * 森空岛应用授权凭证
 * @description 用于获取权限的主要凭证，类似 `refreshToken`
 */
export const STORAGE_CREDENTIAL_KEY = 'skland:cred'

/**
 * 森空岛用户 ID
 */
export const STORAGE_USER_ID_KEY = 'skland:userId'

/**
 * 设备 ID
 */
export const STORAGE_DID_KEY = 'skland:did'
