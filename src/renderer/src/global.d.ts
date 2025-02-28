interface MenuItem {
  path: string
  icon?: any
  title: string
  name?: string
  page?: string
  children?: MenuItem[]
  isHide?: boolean
}

type StatisticParamsType = {
  statisticType: 'taskList' | 'startDate'
  startDate?: string
  endDate?: string
  taskIdList?: string[]
}

interface CallDetail {
  uuid: string
  callType: string
  dialType: string
  agentPhone: string
  customerPhone: string
  firstCallAgent: string
  beginTime: string
  endTime: string
  ringTime: string
  answerTime: string
  ringDuration: number
  talkDuration: number
  callDuration: number
  callResult: string
  hangupType: string
  recordUrl: string
}

interface AgentCallDetail {
  beginTime: string
  uuid: string
  callType: string
  agent: string
  ringTime: string
  answerTime: string
  endTime: string
  talkDuration: number
  callDuration: number
  callResult: string
}
