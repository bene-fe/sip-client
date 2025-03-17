import request from '../utils/request'

export const getSipWebrtcAddr = () => {
  return request('/call-center/agent-workbench/sdk/agent/webrtc/addr', 'GET', {})
}

export const onDialing = () => {
  return request('/call-center/agent-workbench/sdk/agent/status/switch', 'POST', {
    action: 5
  })
}

export const onResting = () => {
  return request('/call-center/agent-workbench/sdk/agent/status/switch', 'POST', {
    action: 6
  })
}

export const onIdle = () => {
  return request('/call-center/agent-workbench/sdk/agent/status/switch', 'POST', {
    action: 2
  })
}

export const onBusy = () => {
  return request('/call-center/agent-workbench/sdk/agent/status/switch', 'POST', {
    action: 7
  })
}

export const transfer = (num: string) => {
  return request('/call-center/agent-workbench/sdk/agent/call/transfer', 'POST', {
    transferTo: num
  })
}

export const wrapUp = (seconds: number) => {
  return request('/call-center/agent-workbench/sdk/agent/wrap-up/extend', 'POST', {
    seconds: seconds
  })
}

export const wrapUpCancel = () => {
  return request('/call-center/agent-workbench/sdk/agent/wrap-up/cancel', 'POST', {})
}

export const getOrgOnlineAgent = () => {
  return request('/call-center/agent-workbench/sdk/agent/org/online', 'GET', {})
}
