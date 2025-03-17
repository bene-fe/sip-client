// import md5 from 'blueimp-md5'

import useStore from '../store/index'

// 坐席用
class SipController {
  client: WebSocket
  agentStatus: number = 1
  loginStatus: boolean = false
  exitStatus: boolean = false
  loginInfo: {
    username: string
    password: string
  }
  auth: {
    token: string
    refreshToken: string
    expireAt: number
  } = {
    token: '',
    refreshToken: '',
    expireAt: 0
  }
  private heartbeatTimer: NodeJS.Timeout | null = null

  constructor(params: {
    protocol?: boolean
    host?: string
    port?: string
    username?: string
    password?: string
    kick?: () => void // 接受kick操作
    statusListener?: (v: number) => void // 接受状态
    callbackInfo?: (v: any) => void // 接受callback info
    groupCallNotify?: (v: any) => void // 接受groupCallNotify
    otherEvent?: (v: any) => void // 接受其他事件
  }) {
    const {
      protocol,
      host,
      port,
      username,
      password,
      kick,
      statusListener,
      callbackInfo,
      groupCallNotify,
      otherEvent
    } = params

    const baseUrl = (protocol ? 'wss' : 'ws') + '://' + host + ':' + port + '/agent-workbench/api/ws'
    this.loginInfo = {
      username: username || '',
      password: password || ''
    }
    this.client = new WebSocket(baseUrl)
    if (kick && statusListener && callbackInfo && groupCallNotify && otherEvent) {
      this.listen(kick, statusListener, callbackInfo, groupCallNotify, otherEvent)
    }
  }

  public listen(
    kick: () => void,
    statusListener: (v: number) => void,
    callbackInfo: (v: any) => void,
    groupCallNotify: (v: any) => void,
    otherEvent: (v: any) => void
  ) {
    this.client.onopen = () => {
      this.login()
    }
    this.client.onmessage = (event: MessageEvent) => {
      const res = JSON.parse(event.data)

      if (res?.action === 'auth' && res?.content) {
        this.auth.token = res?.content?.token
        this.auth.refreshToken = res?.content?.refreshToken
        this.auth.expireAt = res?.content?.expireAt
        this.loginStatus = true
        return
      }

      // 接受服务端的状态
      if (res?.action === 'status') {
        this.agentStatus = res?.content
        return statusListener(res?.content)
      }

      // 接受callback info
      if (res?.action === 'numberInfo') {
        return callbackInfo({
          ...res?.content
        })
      }

      if (res?.action === 'ping') {
        return this.client.send(JSON.stringify({ action: 'pong' }))
      }

      // kick 被踢出就关闭连接
      if (res?.action === 'kick') {
        this.loginStatus = false
        this.client.close()
        this.auth.token = ''
        return kick()
      }

      // 接受groupCallNotify
      if (res?.action === 'groupCallNotify') {
        return groupCallNotify({
          ...res?.content
        })
      }

      // 接受其他事件
      if (res?.action) {
        return otherEvent({
          ...res
        })
      }
    }

    // 当sock断开时
    this.client.onclose = () => {
      this.loginStatus = false
      this.auth.token = ''
      statusListener(1)
      this.clearHeartbeat()
      if (!this.exitStatus) kick()
    }
  }

  public login() {
    // const timestamp = new Date().getTime()
    // const nonce = Math.random().toString(32).substr(2)
    const {
      username
      // password
    } = this.loginInfo
    const token = useStore.getState().token

    this.client.send(
      JSON.stringify({
        action: 'auth',
        params: {
          username,
          token
        }
      })
      //   JSON.stringify({
      //     action: 'login',
      //     actionId: '',
      //     params: {
      //       username,
      //       timestamp,
      //       password: md5(timestamp + password + nonce),
      //       nonce,
      //     },
      //   })
    )
    this.heartBeat()
  }

  public heartBeat() {
    if (this.client.readyState === WebSocket.OPEN) {
      this.client.send(JSON.stringify({ action: 'ping' }))
      this.heartbeatTimer = setTimeout(() => {
        this.heartBeat()
      }, 2000)
    }
  }

  // 在需要停止心跳的地方（如logout或连接关闭时）清除定时器
  private clearHeartbeat() {
    if (this.heartbeatTimer) {
      clearTimeout(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  public logout() {
    this.exitStatus = true
    this.auth.token = ''
    if (this.client.readyState === WebSocket.OPEN) {
      this.client.send(JSON.stringify({ action: 'logout', actionId: '' }))
    }
    this.clearHeartbeat()
  }
}

export default SipController
