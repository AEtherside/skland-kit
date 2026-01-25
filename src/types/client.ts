import type { $Fetch } from 'ofetch'
import type { Driver, Storage } from 'unstorage'
import type { AttendanceAwards, AttendanceStatus, EndfieldAttendanceRecordResponse, EndfieldAttendanceResponse } from './game'
import type { AppBindingList, PlayerInfo } from './player'

export interface ClientConfig {
  baseURL?: string
  /**
   * 超时时间
   */
  timeout?: number
  /**
   * 存储驱动, 默认内存
   * @description 如果需要持久化存储，请传入一个 unstorage driver
   */
  driver?: Driver
}

export interface Client {
  $fetch: $Fetch
  signIn: (authorizeCode: string) => Promise<{
    cred: string
    userId: string
    token: string
  }>
  refresh: () => Promise<{
    token: string
  }>
  collections: ClientCollections
  storage: Storage<string>
}

export interface ClientCollections {
  /**
   * 鹰角通行证相关
   *
   * 提供在没有森空岛授权凭证的情况下，通过鹰角通行证获取森空岛登录的授权凭证的一些方式
   */
  hypergryph: Hypergryph
  /**
   * @deprecated 森空岛 App 相关，有风控的一些功能，暂未实现
   */
  score: ClientScore
  /**
   * 玩家和绑定角色相关
   */
  player: ClientPlayer
  /**
   * 游戏相关，签到等
   */
  game: ClientGame
}

export interface Hypergryph {
  /**
   * 发送手机验证码
   * @param phone 手机号
   */
  sendPhoneCode: (phone: string) => Promise<void>
  /**
   * 生成扫码登录 URL
   * @returns 返回扫码登录 ID 和 森空岛扫码登录 URL。
   */
  generateScanLoginUrl: () => Promise<{ scanId: string, scanUrl: string }>
  /**
   * 获取扫码登录状态
   * @param scanId 扫码登录 ID
   */
  getScanStatus: (scanId: string) => Promise<{ scanCode: string, scanStatus: string }>

  /**
   * 通过手机号和密码获取鹰角 OAuth token
   * @param data 手机号和密码
   */
  getOAuthTokenByPhonePassword: (data: { phone: string, password: string }) => Promise<string>
  /**
   * 通过手机号和验证码获取鹰角 OAuth token
   * @param data 手机号和验证码
   */
  getOAuthTokenByPhoneCode: (data: { phone: string, code: string }) => Promise<string>
  /**
   * 通过扫码获取鹰角 OAuth token
   * @param scanCode 扫码登录 ID
   * @returns 返回鹰角 OAuth token
   */
  getOAuthTokenByScanCode: (scanCode: string) => Promise<string>

  /**
   * 通过 OAuth 登录凭证验证鹰角网络通行证
   *
   * @param token 鹰角网络通行证账号的登录凭证 authorize_code
   * @param options 可以控制授权应用的类型和应用代码等，一般没什么用。
   * @return 返回可以用于 `signIn()`的 authorize_code 参数
   */
  grantAuthorizeCode: (token: string, options?: {
    appCode?: string
    type?: number
  }) => Promise<{ code: string, uid: string }>
}

export interface ClientScore {

}

export interface ClientPlayer {
  getBinding: () => Promise<AppBindingList>
  getInfo: (query: { uid: string }) => Promise<PlayerInfo>
}

export interface ClientGame {
  /**
   * 获取签到状态
   */
  getAttendanceStatus: (query: { uid: string, gameId: string }) => Promise<AttendanceStatus>
  /**
   * 执行签到
   * @param body 签到请求体
   */
  attendance: (body: { uid: string, gameId: string }) => Promise<AttendanceAwards>
  /**
   * 获取终末地签到记录
   * @param gameRole - 格式: {gameId}_{roleId}_{serverId}，例如 "3_1766760475_1"
   */
  getEndfieldAttendanceRecord: (gameRole: string) => Promise<EndfieldAttendanceRecordResponse>
  /**
   * 终末地签到
   * @param gameRole - 格式: {gameId}_{roleId}_{serverId}，例如 "3_1766760475_1"
   */
  endfieldAttendance: (gameRole: string) => Promise<EndfieldAttendanceResponse>
}
