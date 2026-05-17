export * from './building'
export * from './character'
export * from './client'
export * from './game'
export * from './player'

export interface SklandResponse<T> {
  code: number
  message: string
  data: T
}

export type HypergrayphonResType = 'A' | 'C1' | (string & {})

export interface HypergrayphonBaseResponse<Data = any> {
  status?: number
  type?: HypergrayphonResType
  msg: string
  data?: Data
}

export interface HypergrayphonErrorResponse extends HypergrayphonBaseResponse {
  msg: string
}

export interface HypergrayphonFailResponse extends HypergrayphonBaseResponse {
  status: number
  msg: string
  type: HypergrayphonResType
}

export interface HypergrayphonSuccessResponse<Data = any> extends HypergrayphonBaseResponse<Data> {
  status: 0
  /**
   * @description 一般都会是 "A" 不确定，别的够检测了
   */
  type: HypergrayphonResType
  msg: 'OK'
  data: Data
}

export type HypergrayphonResponse<T = any> = HypergrayphonSuccessResponse<T> | HypergrayphonFailResponse | HypergrayphonErrorResponse
