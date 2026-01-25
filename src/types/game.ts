export interface AttendanceStatus {
  currentTs: string
  calendar: {
    resourceId: string
    type: string
    count: number
    available: boolean
    done: boolean
  }[]
  records: {
    resourceId: string
    type: string
    count: number
    ts: string
  }[]
  resourceInfoMap: {
    [key: string]: {
      id: string
      name: string
      type: string
    }
  }
}

export interface AttendanceAwards {
  ts: number
  awards: {
    resource: {
      id: string
      name: string
      type: string
    }
    count: number
  }[]
}

/**
 * 终末地签到记录响应
 */
export interface EndfieldAttendanceRecordResponse {
  code: number
  message: string
  timestamp: string
  data: {
    records: Array<{
      ts: string
      awardId: string
      [key: string]: any
    }>
    resourceInfoMap: Record<string, {
      id: string
      count: number
      name: string
      icon: string
    }>
  }
}

/**
 * 终末地签到响应
 */
export interface EndfieldAttendanceResponse {
  code: number
  message: string
  timestamp: string
  data: {
    ts: string
    awardIds: Array<{
      id: string
      type: number
    }>
    resourceInfoMap: Record<string, {
      id: string
      count: number
      name: string
      icon: string
    }>
    tomorrowAwardIds?: Array<{
      id: string
      type: number
    }>
  }
}

/**
 * 终末地角色信息
 */
export interface EndfieldCharacter {
  uid: string
  appCode: string
  gameId: number
  channelMasterId: string
  nickName: string
  defaultRole?: {
    serverId: string
    roleId: string
    nickname: string
    [key: string]: any
  }
  roles?: Array<{
    serverId: string
    roleId: string
    nickname: string
    [key: string]: any
  }>
}
