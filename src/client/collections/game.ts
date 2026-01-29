import type { FetchOptions } from 'ofetch'
import type { ArknightsAttendanceAwards, ArknightsAttendanceStatus, ClientGame, EndfieldAttendanceAwards, EndfieldAttendanceStatus, SklandResponse } from '../../types'
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
  async function getAttendanceStatus(
    opt: { uid: string, gameId: number },
  ): Promise<ArknightsAttendanceStatus>
  async function getAttendanceStatus(
    opt: { gameId: number, roleId: string, serverId: string },
  ): Promise<EndfieldAttendanceStatus>
  async function getAttendanceStatus(
    opt: { uid: string, gameId: number } | { gameId: number, roleId: string, serverId: string },
  ): Promise<ArknightsAttendanceStatus | EndfieldAttendanceStatus> {
    if ('roleId' in opt && 'serverId' in opt) {
      const res = await fetchGame<EndfieldAttendanceStatus>(
        '/api/v1/game/endfield/attendance',
        {
          headers: {
            'content-type': 'application/json',
            'sk-game-role': `${opt.gameId}_${opt.roleId}_${opt.serverId}`,
          },
        },
        '获取签到状态错误',
      )
      return res.data
    }
    else {
      const res = await fetchGame<ArknightsAttendanceStatus>(
        '/api/v1/game/attendance',
        { query: opt },
        '获取签到状态错误',
      )
      return res.data
    }
  }

  async function attendance(
    opt: { uid: string, gameId: number },
  ): Promise<ArknightsAttendanceAwards>
  async function attendance(
    opt: { gameId: number, roleId: string, serverId: string },
  ): Promise<EndfieldAttendanceAwards>
  async function attendance(
    opt: { uid: string, gameId: number } | { gameId: number, roleId: string, serverId: string },
  ): Promise<ArknightsAttendanceAwards | EndfieldAttendanceAwards> {
    if ('roleId' in opt && 'serverId' in opt) {
      const res = await fetchGame<EndfieldAttendanceAwards>(
        '/api/v1/game/endfield/attendance',
        {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'sk-game-role': `${opt.gameId}_${opt.roleId}_${opt.serverId}`,
            'referer': 'https://game.skland.com/',
            'origin': 'https://game.skland.com/',
          },
        },
        '获取签到信息错误',
      )
      return res.data
    }
    else {
      const res = await fetchGame<ArknightsAttendanceAwards>(
        '/api/v1/game/attendance',
        {
          method: 'POST',
          body: opt,
          headers: { 'content-type': 'application/json' },
        },
        '执行签到错误',
      )
      return res.data
    }
  }

  return {
    getAttendanceStatus,
    attendance,
  }
}
