import { Tabs, Descriptions, Card, Button } from 'antd'
import myCallStore from './my-call-store'
import { PhoneOutlined } from '@ant-design/icons'
import useDialpad from '../../components/dialpad/dialpad'
import { useEffect } from 'react'
import { getTaskAgentNumberDetail } from '../../api/agent-seat'
import { getNumberDetail, getTaskNumberDetail } from '../../api/agent-seat'
import { getAgentNumberDetail } from '../../api/agent-seat'
import { convertTimeZone } from '../../utils'
import useStore from '../../store'

const MyCallContent = ({ className }: { className?: string }) => {
  const { agentDetail } = useStore()
  const { currentCustomer, mainTab, callDetail, agentCallDetail, setCallDetail, setAgentCallDetail } = myCallStore()
  const { makeCall, status } = useDialpad()

  const renderRecordType = (mainTab: string): any => {
    if (mainTab === 'task') {
      return {
        callType: {
          1: '呼入',
          2: '外呼'
        },
        dialType: {
          1: '标准外呼',
          2: '任务外呼'
        },
        callResult: {
          0: '呼叫失败',
          1: '客户未接听',
          2: '坐席未接听',
          3: '双方已接听'
        },
        hangupType: {
          0: '用户挂断',
          1: '系统取消',
          2: '坐席挂断'
        }
      }
    } else {
      return {
        callType: {
          1: '外呼',
          2: '呼入',
          3: '转接'
        },
        dialType: {
          1: '普通外呼',
          2: '呼入',
          3: '外呼任务'
        },
        callResult: {
          4: '呼出-客户接通',
          5: '呼出-客户未接通',
          6: '呼出-呼叫失败'
        },
        hangupType: {
          0: '用户挂断',
          1: '系统取消',
          2: '坐席挂断'
        }
      }
    }
  }

  const renderAgentType = (): any => {
    if (mainTab === 'task') {
      return {
        callType: {
          1: '外呼',
          2: '呼入',
          3: '转接'
        },
        callResult: {
          1: '客户接通',
          2: '客户拒绝',
          3: '客户占线',
          4: '未接听',
          5: '坐席已接听',
          6: '坐席未接听且客户挂断'
        }
      }
    } else {
      return {
        callType: {
          1: '外呼',
          2: '呼入',
          3: '转接'
        },
        callResult: {
          1: '呼入-客户挂断',
          2: '呼入-坐席拒绝接听',
          3: '呼入-坐席已接听',
          4: '呼出-客户接通',
          5: '呼出-客户未接通',
          6: '呼出-呼叫失败',
          7: '转接-坐席已接听',
          8: '转接-坐席拒绝接听',
          9: '转接-客户挂断'
        }
      }
    }
  }

  const handleTask = (uuid: string) => {
    getTaskNumberDetail(uuid).then((r: any) => {
      if (r.code === 0) {
        setCallDetail(r.data)
      }
    })

    getTaskAgentNumberDetail(uuid).then((r: any) => {
      if (r.code === 0) {
        setAgentCallDetail(r.data)
      }
    })
  }

  const handleNormal = (uuid: string) => {
    getNumberDetail(uuid).then((r: any) => {
      if (r.code === 0) {
        setCallDetail(r.data)
      }
    })

    getAgentNumberDetail(uuid).then((r: any) => {
      if (r.code === 0) {
        setAgentCallDetail(r.data)
      }
    })
  }

  useEffect(() => {
    if (currentCustomer?.uuid) {
      if (mainTab === 'task') {
        handleTask(currentCustomer?.uuid)
      } else {
        handleNormal(currentCustomer?.uuid)
      }
    }
  }, [currentCustomer?.uuid])

  const callDetailItems = [
    {
      key: 'record',
      label: '通话记录',
      children: (
        <div className="p-6">
          <Card>
            <Descriptions title="基础信息" column={2}>
              <Descriptions.Item label="呼叫类型">
                {callDetail?.callType !== undefined && renderRecordType(mainTab)?.callType[callDetail?.callType]}
              </Descriptions.Item>
              <Descriptions.Item label="拨号类型">
                {callDetail?.dialType !== undefined && renderRecordType(mainTab)?.dialType[callDetail?.dialType]}
              </Descriptions.Item>
              <Descriptions.Item label="客户电话">{callDetail?.customerPhone}</Descriptions.Item>
              <Descriptions.Item label="坐席电话">{callDetail?.agentPhone}</Descriptions.Item>
              <Descriptions.Item label="首次接听坐席">{callDetail?.firstCallAgent}</Descriptions.Item>
            </Descriptions>

            <Descriptions title="通话信息" column={2} className="mt-4">
              <Descriptions.Item label="开始时间">
                {callDetail?.beginTime ? convertTimeZone(agentDetail?.org?.timezone, callDetail?.beginTime, true) : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="结束时间">
                {callDetail?.endTime ? convertTimeZone(agentDetail?.org?.timezone, callDetail?.endTime, true) : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="振铃时间">
                {callDetail?.ringTime ? convertTimeZone(agentDetail?.org?.timezone, callDetail?.ringTime, true) : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="接听时间">
                {callDetail?.answerTime
                  ? convertTimeZone(agentDetail?.org?.timezone, callDetail?.answerTime, true)
                  : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="振铃时长">
                {callDetail?.ringDuration !== undefined ? `${callDetail.ringDuration}秒` : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="通话时长">
                {callDetail?.talkDuration !== undefined ? `${callDetail.talkDuration}秒` : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="总时长">
                {callDetail?.callDuration !== undefined ? `${callDetail.callDuration}秒` : '-'}
              </Descriptions.Item>
            </Descriptions>

            <Descriptions title="结果信息" column={2} className="mt-4">
              <Descriptions.Item label="通话结果">
                {callDetail?.callResult !== undefined && renderRecordType(mainTab)?.callResult[callDetail?.callResult]}
              </Descriptions.Item>
              <Descriptions.Item label="挂断类型">
                {callDetail?.hangupType !== undefined && renderRecordType(mainTab)?.hangupType[callDetail?.hangupType]}
              </Descriptions.Item>
              <Descriptions.Item label="录音" className="text-center w-full">
                {callDetail?.recordUrl && (
                  <audio controls src={callDetail.recordUrl} className="w-full">
                    您的浏览器不支持音频播放
                  </audio>
                )}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </div>
      )
    },
    {
      key: 'callDetail',
      label: '坐席通话明细',
      children: (
        <div className="p-6">
          <Card>
            {agentCallDetail?.map((detail, index) => (
              <div key={detail.uuid} className={`${index > 0 ? 'mt-8 pt-8 border-t' : ''}`}>
                <Descriptions
                  column={2}
                  colon={false}
                  className="mb-4"
                  title={`${convertTimeZone(agentDetail?.org?.timezone, detail.beginTime, true)}`}
                >
                  <Descriptions.Item label="通话类型">
                    {detail.callType !== undefined && renderAgentType()?.callType[detail.callType]}
                  </Descriptions.Item>
                  <Descriptions.Item label="坐席" labelStyle={{ fontWeight: 500 }}>
                    {detail.agent}
                  </Descriptions.Item>
                  <Descriptions.Item label="振铃时间" labelStyle={{ fontWeight: 500 }}>
                    {detail.ringTime ? convertTimeZone(agentDetail?.org?.timezone, detail.ringTime, true) : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="接听时间" labelStyle={{ fontWeight: 500 }}>
                    {detail.answerTime ? convertTimeZone(agentDetail?.org?.timezone, detail?.answerTime, true) : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="结束时间" labelStyle={{ fontWeight: 500 }}>
                    {detail.endTime ? convertTimeZone(agentDetail?.org?.timezone, detail.endTime, true) : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="通话时长" labelStyle={{ fontWeight: 500 }}>
                    {detail.talkDuration ? `${detail.talkDuration} 秒` : ''}
                  </Descriptions.Item>
                  <Descriptions.Item label="总时长" labelStyle={{ fontWeight: 500 }}>
                    {detail.callDuration ? `${detail.callDuration} 秒` : ''}
                  </Descriptions.Item>
                  <Descriptions.Item label="通话结果" labelStyle={{ fontWeight: 500 }}>
                    {detail.callResult !== undefined && renderAgentType()?.callResult[detail.callResult]}
                  </Descriptions.Item>
                </Descriptions>
              </div>
            ))}
          </Card>
        </div>
      )
    }
  ]

  const items = [
    {
      key: 'customer',
      label: '客户',
      children: (
        <div className="p-6">
          <Card>
            <Descriptions title="客户资料" column={2}>
              <Descriptions.Item label="Phone">{currentCustomer?.phone}</Descriptions.Item>
              <Descriptions.Item label="Begin Time">
                {currentCustomer?.beginTime
                  ? convertTimeZone(agentDetail?.org?.timezone, currentCustomer?.beginTime, true)
                  : '-'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </div>
      )
    },
    {
      key: 'call',
      label: '通话详情',
      children: (
        <div>
          <Tabs
            defaultActiveKey="call"
            items={callDetailItems}
            className="flex-1 px-0"
            tabBarStyle={{
              padding: '0 16px',
              marginBottom: 0,
              borderBottom: '1px solid #f0f0f0'
            }}
          />
        </div>
      )
    }
  ]

  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="p-4 border-b flex justify-between items-center">
        <h1 className="text-xl font-medium">{currentCustomer?.phone}</h1>
        <Button
          icon={<PhoneOutlined />}
          variant="outlined"
          className="border-gray-300"
          disabled={status !== 2}
          onClick={() => {
            if (currentCustomer?.phone) {
              makeCall(currentCustomer?.phone)
            }
          }}
        />
      </div>
      <Tabs
        defaultActiveKey="call"
        items={items}
        className="flex-1 px-0"
        tabBarStyle={{
          padding: '0 16px',
          marginBottom: 0,
          borderBottom: '1px solid #f0f0f0'
        }}
      />
    </div>
  )
}

export default MyCallContent
