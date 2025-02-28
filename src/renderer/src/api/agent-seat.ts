import request from '../utils/request'

interface GetTaskNumberPageParams {
  phone: string | null
  isMissed: boolean
  pageNumber: number
  pageSize: number
  sorts?: {
    field: string
    asc: boolean
  }[]
}

export const getTaskNumberPage = (params: GetTaskNumberPageParams) => {
  params.sorts = params.sorts || [
    {
      field: 'gmt_create',
      asc: false
    }
  ]

  return request(`/call-center/agent-workbench/task/number/page`, 'POST', params)
}

export const getTaskNumberDetail = (uuid: string) => {
  return request(`/call-center/agent-workbench/task/number/details/${uuid}`, 'GET', {})
}

export const getTaskAgentNumberDetail = (uuid: string) => {
  return request(`/call-center/agent-workbench/task/number/details/agent/${uuid}`, 'GET', {})
}

export const getNumberPage = (params: GetTaskNumberPageParams) => {
  params.sorts = params.sorts || [
    {
      field: 'gmt_create',
      asc: false
    }
  ]

  return request(`/call-center/agent-workbench/cdr/page`, 'POST', params)
}

export const getNumberDetail = (uuid: string) => {
  return request(`/call-center/agent-workbench/cdr/details/${uuid}`, 'GET', {})
}

export const getAgentNumberDetail = (uuid: string) => {
  return request(`/call-center/agent-workbench/cdr/details/agent/${uuid}`, 'GET', {})
}

export const queryCallSummary = (callUuid: string) => {
  return request(`/call-center/agent-workbench/call-summary/${callUuid}`, 'GET', {})
}

export const addCallSummary = (params: { callUuid: string; callType: string; status: string; remark: string }) => {
  return request(`/call-center/agent-workbench/call-summary`, 'POST', params)
}
