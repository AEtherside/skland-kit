import type { Building } from './building'
import type { AssistCharacter, Character, CharacterInfo, EquipmentInfo, Skin, SkinInfo } from './character'

/** 游戏角色状态 */
export interface Status {
  uid: string
  name: string
  level: number
  avatar: Avatar
  /**
   * 注册时间
   * @note unix 时间戳
   */
  registerTs: number
  /** 主线进度 */
  mainStageProgress: string
  secretary: Pick<Character, 'charId' | 'skinId'>
  resume: string
  subscriptionEnd: number
  ap: ActionPoint
  storeTs: number
  lastOnlineTs: number
  charCnt: number
  furnitureCnt: number
  skinCnt: number
}

/** 头像设置 */
export interface Avatar {
  type: 'ICON' | (string & {})
  id: string
  url: string
}

/** 理智 */
export interface ActionPoint {
  current: number
  max: number
  lastApAddTime: number
  completeRecoveryTime: number
}

/** 公招 */
export interface Recruit {
  startTs: number
  finishTs: number
  state: 0 | 1 | 2 | 3
}

/**
 * 剿灭作战信息
 */
export interface Campaign {
  records: CampaignRecord[]
  reward: CampaignReward
}

/**
 * 剿灭作战纪录
 */
export interface CampaignRecord {
  campaignId: string
  maxKills: number
}

/**
 * 剿灭作战奖励
 */
export interface CampaignReward {
  current: number
  total: number
}

/**
 * 剿灭作战地图信息
 */
export interface CampaignLevelInfo {
  id: string
  name: string
  campaignZoneId: string
}

/**
 * 剿灭作战区域信息
 */
export interface CampaignZoneInfo {
  id: string
  name: string
}

/**
 * 保全派驻信息
 */
export interface Tower {
  records: TowerRecord[]
  reward: TowerReward
}

/**
 * 保全派驻纪录
 */
export interface TowerRecord {
  towerId: string
  best: number
}

/**
 * 保全派驻奖励
 */
export interface TowerReward {
  higherItem: { current: number, total: number }
  lowerItem: { current: number, total: number }
  termTs: number
}

/**
 * 保全派驻区域信息
 */
export interface TowerZoneInfo {
  id: string
  name: string
  subName: string
}

/**
 * 集成战略
 */
export interface Rogue {
  records: RougeRecord[]
}

/**
 * 集成战略记录
 */
export interface RougeRecord {
  rogueId: string
  relicCnt: number
  bank: { current: number, record: number }
}

/**
 * 集成战略主题信息
 */
export interface RogueThemeInfo {
  id: string
  name: string
  sort: number
}

/**
 * 日常周常
 */
export interface Routine {
  daily: { current: number, total: number }
  weekly: { current: number, total: number }
}

/**
 * 活动
 */
export interface Activity {
  actId: string
  actReplicaId: string
  zones: {
    zoneId: string
    zoneReplicaId: string
    clearedStage: number
    totalStage: number
  }[]
}

/**
 * 活动信息
 */
export interface ActivityInfo {
  id: string
  name: string
  startTime: number
  endTime: number
  rewardEndTime: number
  isReplicate: boolean
  type: string
}

/**
 * 活动关卡信息
 */
export interface StageLevelInfo {
  id: string
  code: string
  name: string
}

export interface ManufactureFormulaInfo {
  id: string
  itemId: string
  count: number
  weight: number
  costPoint: number
}

export interface AppBindingRole {
  serverId: string
  serverType: string
  serverName: string
  roleId: string
  nickname: string
  level: number
  isDefault: boolean
  isBanned: boolean
}

export interface AppBindingPlayer {
  uid: string
  isOfficial: boolean
  isDefault: boolean
  channelMasterId: string
  channelName: string
  nickName: string
  isDelete: boolean
  gameName: string
  gameId: number
  roles: AppBindingRole[]
  defaultRole: AppBindingRole | null
}

export interface AppBindingList {
  list: {
    appCode: string
    appName: string
    bindingList: AppBindingPlayer[]
    defaultUid: string
  }[]
}

export interface PlayerInfo {
  showConfig: {
    charSwitch: boolean
    skinSwitch: boolean
    standingsSwitch: boolean
  }
  currentTs: number
  status: Status
  assistChars: AssistCharacter[]
  chars: Character[]
  recruit: Recruit[]
  charInfoMap: { [id: string]: CharacterInfo }
  building: Building
  skins: Skin[]
  skinInfoMap: { [id: string]: SkinInfo }
  campaign: Campaign
  campaignInfoMap: { [id: string]: CampaignLevelInfo }
  campaignZoneInfoMap: { [id: string]: CampaignZoneInfo }
  equipmentInfoMap: { [id: string]: EquipmentInfo }
  tower: Tower
  towerInfoMap: { [id: string]: TowerZoneInfo }
  rogue: Rogue
  rogueInfoMap: { [id: string]: RogueThemeInfo }
  routine: Routine
  activity: Activity[]
  activityInfoMap: { [id: string]: ActivityInfo }
  stageInfoMap: { [id: string]: StageLevelInfo }
  manufactureFormulaInfoMap: { [id: number]: ManufactureFormulaInfo }
  charAssets: never[]
  skinAssets: never[]
  activityBannerList: {
    list: {
      activityId: string
      imgUrl: string
      url: string
      startTs: number
      endTs: number
      offlineTs: number
    }[]
  }
  bossRush: {
    id: string
    record: {
      played: boolean
      stageId: string
      difficulty: string
    }
  }[]
}

export interface EndfieldDetails {
  achieve: {
    achieveMedals: unknown[]
    count: number
    display: unknown
  }
  base: {
    avatarUrl: string
    charNum: number
    /** unix timestamp */
    createTime: string
    docNum: number
    exp: number
    gender: number
    /** unix timestamp */
    lastLoginTime: string
    level: number
    mainMission: {
      description: string
      id: string
    }
    name: string
    roleId: string
    /** unix timestamp */
    saveTime: string
    serverName: string
    weaponNum: number
    worldLevel: number
  }
  bpSystem: {
    curLevel: number
    maxLevel: number
  }
  chars: {
    gender: 'CHAR_GENDER_FEMALE'
    id: string
    level: number
    /** unix timestamp */
    ownTs: string
    potentialLevel: number
    evolvePhase: number
    armEquip: EndfieldEquipment
    bodyEquip: EndfieldEquipment
    secondAccessory: EndfieldEquipment
    weapon: {
      breakthroughLevel: number
      gem: {
        icon: string
        id: string
      }
      level: number
      refineLevel: number
      weaponData: {
        description: string
        function: string
        iconUrl: string
        id: string
        name: string
        rarity: EndfieldEnumItem
        skills: EndfieldEnumItem[]
        type: EndfieldEnumItem
      }
    }
    charData: {
      avatarRtUrl: string
      avatarSqUrl: string
      id: string
      illustrationUrl: string
      labelType: string
      name: string
      profession: EndfieldEnumItem
      property: EndfieldEnumItem
      rarity: EndfieldEnumItem
      skills: Array<{
        desc: string
        descLevelParams: Record<string, {
          level: string
          params: {
            atb: string
            atk_scale: string
            display_atk_scale: string
            poise: string
          }
        }>
        descParams: unknown
        iconUrl: string
        id: string
        name: string
        property: EndfieldEnumItem
        type: EndfieldEnumItem
      }>
      tags: string[]
      weaponType: EndfieldEnumItem
    }
    tacticalItem: {
      id: string
      name: string
      iconUrl: string
      rarity: EndfieldEnumItem
      activeEffectType: EndfieldEnumItem
      activeEffect: string
      passiveEffect: string
      activeEffectParams: Record<string, string>
      passiveEffectParams: Record<string, string>
    }
    userSkills: Record<string, {
      level: number
      maxLevel: number
      skillId: string
    }>
  }[]
  config: {
    charIds: string[]
    charSwitch: boolean
  }
  /** unix timestamp */
  currentTs: string
  dailyMission: {
    dailyActivation: number
    maxDailyActivation: number
  }
  domain: {
    collections: {
      blackboxCount: number
      levelId: string
      pieceCount: number
      puzzleCount: number
      trchestCount: number
    }[]
    domainId: string
    factory: null
    level: number
    moneyMgr: string
    name: string
    dungeon: {
      curStamina: string
      maxStamina: string
      /** unix timestamp */
      maxTs: string
    }
    settlements: {
      id: string
      level: number
      name: string
      officerCharIds: string
      remainMoney: string
    }[]
    quickaccess: {
      icon: string
      link: string
      name: string
    }[]

    spaceShip: {
      rooms: {
        chars: {
          charId: string
          favorability: number
          physicalStrength: number
        }[]
        id: string
        level: number
        reports: {
          [createdTimeTs: string]: {
            char: string[]
            /** unix timestamp */
            createdTimeTs: string
            output: {
              [itemId: string]: number
            }
          }
        }
        type: number
      }[]
    }
  }[]
}

export interface EndfieldEnumItem {
  key: string
  value: string
}

export interface EndfieldEquipment {
  equipData: {
    function: string
    iconUrl: string
    id: string
    isAccessory: boolean
    level: {
      key: string
      value: string
    }
    name: string
    pkg: string
    properties: string[]
    rarity: {
      key: string
      value: string
    }
    suit: {
      id: string
      name: string
      skillDesc: string
      skillDescParams: {
        atk_up: string
        crit_up: string
        crit_up2: string
        duration: string
        max_stack: string
      }
      skillId: string
    }
    type: {
      key: string
      value: string
    }
  }
  equipId: string
}
