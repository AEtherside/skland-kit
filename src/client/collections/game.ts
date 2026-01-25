import type { FetchOptions } from 'ofetch'
import type { AttendanceAwards, AttendanceStatus, ClientGame, EndfieldAttendanceRecordResponse, EndfieldAttendanceResponse, SklandResponse } from '../../types'
import { signRequest } from '../../utils/signature'
import { useClientContext } from '../ctx'

export function buildGameCollection(): ClientGame {
  const { $fetch, storage } = useClientContext()

  async function fetchGame<T = any>(
    url: string,
    options: FetchOptions<'json'>,
    errorMessage: string,
  ): Promise<SklandResponse<T>> {
    const res = await $fetch<SklandResponse<T>>(url, {
      ...options,
      onRequest: ctx => signRequest(ctx, storage),
      onResponseError(ctx) {
        throw new Error(`【skland-kit】${errorMessage}`, { cause: ctx.response._data })
      },
    })

    if (res.code !== 0) {
      throw new Error(`【skland-kit】${errorMessage}`, { cause: res })
    }

    return res
  }
  return {
    async getAttendanceStatus(query) {
      const res = await fetchGame<AttendanceStatus>(
        '/api/v1/game/attendance',
        { query },
        '获取签到状态错误',
      )
      return res.data
    },
    async attendance(body) {
      const res = await fetchGame<AttendanceAwards>(
        '/api/v1/game/attendance',
        { method: 'POST', body },
        '执行签到错误',
      )
      return res.data
    },
    /**
     * 获取终末地签到记录
     * @param gameRole - 格式: {gameId}_{roleId}_{serverId}，例如 "3_1766760475_1"
     */
    async getEndfieldAttendanceRecord(gameRole: string): Promise<EndfieldAttendanceRecordResponse> {
      const url = '/web/v1/game/endfield/attendance/record'

      return await $fetch<EndfieldAttendanceRecordResponse>(url, {
        method: 'GET',
        onRequest: ctx => signRequest(ctx, storage, {
          'sk-game-role': gameRole,
        }),
        onResponseError(ctx) {
          throw new Error('【skland-kit】获取终末地签到记录错误', { cause: ctx.response._data })
        },
      })
    },
    /**
     * 终末地签到
     * @param gameRole - 格式: {gameId}_{roleId}_{serverId}，例如 "3_1766760475_1"
     */
    async endfieldAttendance(gameRole: string): Promise<EndfieldAttendanceResponse> {
      const url = '/web/v1/game/endfield/attendance'

      return await $fetch<EndfieldAttendanceResponse>(url, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        onRequest: ctx => signRequest(ctx, storage, {
          'sk-game-role': gameRole,
        }),
        onResponseError(ctx) {
          throw new Error('【skland-kit】终末地签到错误', { cause: ctx.response._data })
        },
      })
    },
  }
}
