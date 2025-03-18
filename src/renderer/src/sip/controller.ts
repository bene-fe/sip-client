// import md5 from 'blueimp-md5'

import useStore from '../store/index'

// 坐席用
class SipController {
  client: WebSocket
  agentStatus: number = 1
  loginStatus: boolean = false
  exitStatus: boolean = false
  rtpId: string = ''
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
  // 重连相关属性
  private reconnectTimer: NodeJS.Timeout | null = null
  private reconnectAttempts: number = 0
  private maxReconnectAttempts: number = 10
  private reconnectInterval: number = 3000 // 3秒
  private isReconnecting: boolean = false
  private protocol?: boolean
  private host?: string
  private port?: string
  private kick?: () => void
  private statusListener?: (v: number) => void
  private callbackInfo?: (v: any) => void
  private groupCallNotify?: (v: any) => void
  private otherEvent?: (v: any) => void

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

    // 保存连接参数，以便重连时使用
    this.protocol = protocol
    this.host = host
    this.port = port
    this.kick = kick
    this.statusListener = statusListener
    this.callbackInfo = callbackInfo
    this.groupCallNotify = groupCallNotify
    this.otherEvent = otherEvent

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

  private initWebSocket() {
    if (!this.host || !this.port) return

    const baseUrl = (this.protocol ? 'wss' : 'ws') + '://' + this.host + ':' + this.port + '/agent-workbench/api/ws'
    this.client = new WebSocket(baseUrl)

    if (this.kick && this.statusListener && this.callbackInfo && this.groupCallNotify && this.otherEvent) {
      this.listen(this.kick, this.statusListener, this.callbackInfo, this.groupCallNotify, this.otherEvent)
    }
  }

  private startReconnect() {
    if (this.isReconnecting || this.exitStatus) return

    this.isReconnecting = true
    this.reconnectAttempts = 0
    this.tryReconnect()
  }

  private tryReconnect() {
    if (this.exitStatus) {
      this.isReconnecting = false
      return
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('达到最大重连次数，停止重连')
      this.isReconnecting = false
      return
    }

    this.reconnectTimer = setTimeout(() => {
      console.log(`尝试重连 (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`)
      this.reconnectAttempts++

      // 清理旧连接
      if (this.client) {
        try {
          this.client.close()
        } catch (e) {
          // 忽略关闭错误
        }
      }

      // 初始化新连接
      this.initWebSocket()

      // 如果连接失败，继续尝试
      this.reconnectTimer = setTimeout(() => {
        if (this.client.readyState !== WebSocket.OPEN) {
          this.tryReconnect()
        }
      }, 1000)
    }, this.reconnectInterval)
  }

  private clearReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    this.isReconnecting = false
    this.reconnectAttempts = 0
  }

  public listen(
    kick: () => void,
    statusListener: (v: number) => void,
    callbackInfo: (v: any) => void,
    groupCallNotify: (v: any) => void,
    otherEvent: (v: any) => void
  ) {
    this.client.onopen = () => {
      console.log('WebSocket连接已打开')
      this.clearReconnect() // 连接成功，清除重连
      this.login()
    }
    this.client.onmessage = (event: MessageEvent) => {
      const res = JSON.parse(event.data)

      if (res?.action === 'auth' && res?.content) {
        this.auth.token = res?.content?.token
        this.auth.refreshToken = res?.content?.refreshToken
        this.auth.expireAt = res?.content?.expireAt
        this.rtpId = res?.content?.rtpengineId
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
    this.client.onclose = (event) => {
      console.log('WebSocket连接已关闭', event.code, event.reason)
      this.loginStatus = false
      this.auth.token = ''
      statusListener(1)
      this.clearHeartbeat()

      // 如果不是主动退出，尝试重连
      if (!this.exitStatus) {
        console.log('非主动退出，准备重连')
        this.startReconnect()
        kick() // 通知上层处理断开状态
      }
    }

    // 添加错误处理
    this.client.onerror = (error) => {
      console.error('WebSocket连接错误:', error)
      // 错误时不做特殊处理，让onclose处理断线重连
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
    this.clearReconnect() // 退出时清除重连
  }

  // 重置重连次数，可用于手动重连
  public resetReconnect() {
    this.clearReconnect()
    if (!this.loginStatus && !this.exitStatus) {
      this.startReconnect()
    }
  }

  // 设置重连参数
  public setReconnectParams(maxAttempts?: number, interval?: number) {
    if (maxAttempts !== undefined) {
      this.maxReconnectAttempts = maxAttempts
    }
    if (interval !== undefined) {
      this.reconnectInterval = interval
    }
  }
}

export default SipController
