export interface ArknightsAttendanceStatus {
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
    [resourceId: string]: {
      id: string
      name: string
      type: string
    }
  }
}

export interface EndfieldAttendanceStatus {
  currentTs: string
  calendar: {
    available: boolean
    awardId: string
    done: boolean
  }[]
  first: {
    available: boolean
    awardId: string
    done: boolean
  }[]
  hasToday: boolean
  resourceInfoMap: {
    [awardId: string]: {
      count: number
      icon: string
      id: string
      name: string
    }
  }
}

export interface ArknightsAttendanceAwards {
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

export interface EndfieldAttendanceAwards {
  awardIds: {
    id: string
    type: number
  }[]
  resourceInfoMap: {
    [awardId: string]: {
      count: number
      icon: string
      id: string
      name: string
    }
  }
  tomorrowAwardIds: {
    id: string
    type: number
  }[]
  ts: string
}
