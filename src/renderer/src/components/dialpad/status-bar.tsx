import { Button, Input, Select, message } from 'antd'
import useDialpad from './dialpad'
import TimeCount, { TimeAction } from './time-count'
import { PhoneFilled, UserOutlined, SyncOutlined } from '@ant-design/icons'
import DialpadIcon from './dialpad-icon'
import { useState, cloneElement } from 'react'
import SignalDisplay from '../signal-display'

const StatusBar = (props: { className?: string }) => {
  const {
    setResting,
    setBusy,
    setIdle,
    sipState,
    countTimeAction,
    status,
    setSipInstance,
    logout,
    setCountTimeAction,
    loginInfo,
    makeCall,
    getOrgOnlineAgent
  } = useDialpad()

  const [phoneNumber, setPhoneNumber] = useState<any>(null)
  const [isDialpadVisible, setIsDialpadVisible] = useState(false)
  const [showAgentChange, setShowAgentChange] = useState(false)
  const [agentList, setAgentList] = useState([])

  const handleChangeStatus = (value: number) => {
    setCountTimeAction(TimeAction.Stop)
    switch (value) {
      case 2:
        if (status === 1) {
          setSipInstance(loginInfo)
          break
        }
        setIdle()
        break
      case 6:
        setResting()
        break
      case 7:
        if (status === 1) {
          setSipInstance(loginInfo)
          setTimeout(() => {
            setBusy()
          }, 2000)
          break
        }
        setBusy()
        break
      case 1:
        logout()
        break
    }
    setTimeout(() => {
      if (status !== 1) {
        setCountTimeAction(TimeAction.Start)
      }
    }, 500)
  }

  const handleDigitClick = (digit: string) => {
    setPhoneNumber((prev) => prev + digit)
  }

  const handleAgentList = () => {
    setShowAgentChange(!showAgentChange)
    getOrgOnlineAgent().then((res: any) => {
      if (res.code === 0) {
        setAgentList(res.data)
      }
    })
  }

  const renderDialpad = () => {
    const digits = [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      ['*', '0', '#']
    ]

    return (
      <div className="bg-white shadow-xl rounded-xl z-50 w-full border border-gray-100">
        <div className="flex flex-row items-center justify-between p-3 border-b border-gray-100">
          <span className="text-gray-700 font-medium">拨号盘</span>
          <Button
            type="text"
            shape="circle"
            icon={<UserOutlined className="text-gray-600" />}
            onClick={handleAgentList}
          />
        </div>
        <div className="grid grid-cols-3 gap-3 p-4">
          {digits.map((row, rowIndex) =>
            row.map((digit, colIndex) => (
              <Button
                key={`${rowIndex}-${colIndex}`}
                className="aspect-square text-2xl min-w-[60px] hover:bg-gray-50 transition-colors"
                onClick={() => handleDigitClick(digit)}
              >
                {digit}
              </Button>
            ))
          )}
          <div className="flex justify-center col-span-3 mt-2">{renderCallButton({ size: 'large' })}</div>
        </div>
        {showAgentChange && (
          <div className="border-t border-gray-100 max-h-[350px] overflow-hidden">
            <div className="p-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <span className="text-sm text-gray-600 font-medium">在线坐席</span>
              <Button
                type="text"
                size="small"
                icon={<SyncOutlined className="text-gray-500" />}
                onClick={() => {
                  getOrgOnlineAgent().then((res: any) => {
                    if (res.code === 0) {
                      setAgentList(res.data)
                    }
                  })
                }}
              />
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {agentList.map((agent, index) => (
                <div
                  key={index}
                  className="w-full px-4 py-3 hover:bg-gray-50 transition-all duration-200 cursor-pointer flex items-center gap-3 group border-b border-gray-100 last:border-b-0"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-medium">
                    {index + 1}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-700 text-sm font-medium">坐席 {agent}</span>
                    <span className="text-gray-400 text-xs">Extension #{(index + 1).toString().padStart(3, '0')}</span>
                  </div>
                  <Button
                    type="text"
                    shape="circle"
                    icon={<PhoneFilled className="text-green-500" />}
                    className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => makeCall(agent)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderCallButton = ({ size = 'small' }: { size?: 'large' | 'small' }) => {
    return (
      <Button
        size={size}
        type="text"
        shape="circle"
        disabled={[1, 8, 5, 4, 3].includes(status) || !phoneNumber}
        icon={
          <PhoneFilled
            className={`${![1, 8, 5, 4, 3].includes(status) && phoneNumber ? 'text-green-500' : 'text-gray-300'} flex items-center justify-center`}
          />
        }
        className={`text-xl flex items-center justify-center shadow-lg transition-all duration-200 `}
        onClick={handleMakeCall}
      />
    )
  }

  const handleMakeCall = () => {
    if (!phoneNumber) {
      message.info('Please enter a phone number')
      return
    }
    makeCall(phoneNumber)
    setPhoneNumber('')
  }

  return (
    <div className={`flex flex-row items-center gap-3 ${props.className}`}>
      <div className="flex flex-row items-center gap-3">
        <Select
          className="w-28"
          disabled={sipState.statusIsCall || sipState.statusIsring || [8, 4, 5, 3].includes(status)}
          value={status}
          onChange={handleChangeStatus}
          dropdownRender={(menu) => {
            const items = menu?.props?.items?.filter?.((item: any) => ![3, 4, 5, 8].includes(item.value))
            return cloneElement(menu as React.ReactElement, { items })
          }}
          options={[
            {
              label: (
                <div className="flex items-center gap-2 py-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                  在线
                </div>
              ),
              value: 2
            },
            {
              label: (
                <div className="flex items-center gap-2 py-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                  小休
                </div>
              ),
              value: 6
            },
            {
              label: (
                <div className="flex items-center gap-2 py-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                  忙碌
                </div>
              ),
              value: 7
            },
            {
              label: (
                <div className="flex items-center gap-2 py-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-500"></div>
                  离线
                </div>
              ),
              value: 1
            },
            {
              label: (
                <div className="flex items-center gap-2 py-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                  响铃中
                </div>
              ),
              value: 3,
              disabled: true
            },
            {
              label: (
                <div className="flex items-center gap-2 py-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-purple-500"></div>
                  通话中
                </div>
              ),
              value: 4,
              disabled: true
            },
            {
              label: (
                <div className="flex items-center gap-2 py-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div>
                  呼叫中
                </div>
              ),
              value: 5,
              disabled: true
            },
            {
              label: (
                <div className="flex items-center gap-2 py-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div>
                  整理中
                </div>
              ),
              value: 8,
              disabled: true
            }
          ]}
        />

        <div className="w-[70px] bg-gray-50 rounded-md">
          <TimeCount action={countTimeAction} />
        </div>
      </div>

      <div className="flex flex-row items-center gap-3 relative flex-1">
        <Input
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          disabled={sipState.statusIsCall || sipState.statusIsring}
          className="shadow-sm"
          placeholder="输入电话号码"
          addonBefore={
            <div className="flex items-center justify-center w-[38px] px-1">
              <SignalDisplay width={12} height={12} />
            </div>
          }
          addonAfter={
            <div className="flex items-center gap-2">
              <Button
                size="small"
                type="text"
                shape="circle"
                icon={<DialpadIcon className="w-6 h-6 text-gray-600 hover:text-gray-800 transition-colors" />}
                onClick={() => setIsDialpadVisible(!isDialpadVisible)}
              />
              {!isDialpadVisible && renderCallButton({ size: 'small' })}
            </div>
          }
        />

        {isDialpadVisible && <div className="absolute top-full left-0 right-0 mt-2">{renderDialpad()}</div>}
      </div>
    </div>
  )
}

export default StatusBar
