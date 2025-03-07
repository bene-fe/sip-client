import { Tabs, Descriptions, Card, Button, Spin } from 'antd'
import myCallStore from './my-call-store'
import { PhoneOutlined } from '@ant-design/icons'
import useDialpad from '../../components/dialpad/dialpad'
import { useEffect } from 'react'
import { getTaskAgentNumberDetail } from '../../api/agent-seat'
import { getNumberDetail, getTaskNumberDetail } from '../../api/agent-seat'
import { getAgentNumberDetail } from '../../api/agent-seat'
import { convertTimeZone } from '../../utils'
import useStore from '../../store'
import { useTranslation } from 'react-i18next'

const MyCallContent = ({ className }: { className?: string }) => {
  const { agentDetail } = useStore()
  const {
    currentCustomer,
    mainTab,
    callDetail,
    agentCallDetail,
    setCallDetail,
    setAgentCallDetail,
    setContentLoading,
    contentLoading
  } = myCallStore()
  const { makeCall, status } = useDialpad()
  const { t } = useTranslation()

  const renderRecordType = (mainTab: string): any => {
    if (mainTab === 'task') {
      return {
        callType: {
          1: t('descriptions.callType1'),
          2: t('descriptions.callType2')
        },
        dialType: {
          1: t('descriptions.dialType1Task'),
          2: t('descriptions.dialType2Task')
        },
        callResult: {
          0: t('descriptions.callResult0Task'),
          1: t('descriptions.callResult1Task'),
          2: t('descriptions.callResult2Task'),
          3: t('descriptions.callResult3Task')
        },
        hangupType: {
          0: t('descriptions.hangupType0'),
          1: t('descriptions.hangupType1'),
          2: t('descriptions.hangupType2')
        }
      }
    } else {
      return {
        callType: {
          1: t('descriptions.callType2'),
          2: t('descriptions.callType1'),
          3: t('descriptions.callType3')
        },
        dialType: {
          1: t('descriptions.dialType1Normal'),
          2: t('descriptions.dialType2Normal'),
          3: t('descriptions.dialType3Normal')
        },
        callResult: {
          4: t('descriptions.callResult4Normal'),
          5: t('descriptions.callResult5Normal'),
          6: t('descriptions.callResult6Normal')
        },
        hangupType: {
          0: t('descriptions.hangupType0'),
          1: t('descriptions.hangupType1'),
          2: t('descriptions.hangupType2')
        }
      }
    }
  }

  const renderAgentType = (): any => {
    if (mainTab === 'task') {
      return {
        callType: {
          1: t('descriptions.callType2'),
          2: t('descriptions.callType1'),
          3: t('descriptions.callType3')
        },
        callResult: {
          1: t('descriptions.agentCallResult1Task'),
          2: t('descriptions.agentCallResult2Task'),
          3: t('descriptions.agentCallResult3Task'),
          4: t('descriptions.agentCallResult4Task'),
          5: t('descriptions.agentCallResult5Task'),
          6: t('descriptions.agentCallResult6Task')
        }
      }
    } else {
      return {
        callType: {
          1: t('descriptions.callType2'),
          2: t('descriptions.callType1'),
          3: t('descriptions.callType3')
        },
        callResult: {
          1: t('descriptions.agentCallResult1Normal'),
          2: t('descriptions.agentCallResult2Normal'),
          3: t('descriptions.agentCallResult3Normal'),
          4: t('descriptions.agentCallResult4Normal'),
          5: t('descriptions.agentCallResult5Normal'),
          6: t('descriptions.agentCallResult6Normal'),
          7: t('descriptions.agentCallResult7Normal'),
          8: t('descriptions.agentCallResult8Normal'),
          9: t('descriptions.agentCallResult9Normal')
        }
      }
    }
  }

  const handleTask = async (uuid: string) => {
    setContentLoading(true)

    try {
      const taskNumberResponse: any = await getTaskNumberDetail(uuid)
      if (taskNumberResponse?.code === 0) {
        setCallDetail(taskNumberResponse.data)
      }

      const taskAgentNumberResponse: any = await getTaskAgentNumberDetail(uuid)
      if (taskAgentNumberResponse?.code === 0) {
        setAgentCallDetail(taskAgentNumberResponse.data)
      }
    } catch (error) {
      console.error('获取任务详情失败', error)
    } finally {
      setContentLoading(false)
    }
  }

  const handleNormal = async (uuid: string) => {
    setContentLoading(true)

    try {
      const numberResponse: any = await getNumberDetail(uuid)
      if (numberResponse.code === 0) {
        setCallDetail(numberResponse.data)
      }

      const agentNumberResponse: any = await getAgentNumberDetail(uuid)
      if (agentNumberResponse.code === 0) {
        setAgentCallDetail(agentNumberResponse.data)
      }
    } catch (error) {
      console.error('获取通话详情失败', error)
    } finally {
      setContentLoading(false)
    }
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
      label: t('descriptions.callRecord'),
      children: (
        <div className="p-6">
          <Card loading={contentLoading}>
            <Descriptions title={t('descriptions.basicInfo')} column={2}>
              <Descriptions.Item label={t('descriptions.callType')}>
                {callDetail?.callType !== undefined && renderRecordType(mainTab)?.callType[callDetail?.callType]}
              </Descriptions.Item>
              <Descriptions.Item label={t('descriptions.dialType')}>
                {callDetail?.dialType !== undefined && renderRecordType(mainTab)?.dialType[callDetail?.dialType]}
              </Descriptions.Item>
              <Descriptions.Item label={t('descriptions.customerPhone')}>{callDetail?.customerPhone}</Descriptions.Item>
              <Descriptions.Item label={t('descriptions.agentPhone')}>{callDetail?.agentPhone}</Descriptions.Item>
              <Descriptions.Item label={t('descriptions.firstCallAgent')}>
                {callDetail?.firstCallAgent}
              </Descriptions.Item>
            </Descriptions>

            <Descriptions title={t('descriptions.callInfo')} column={2} className="mt-4">
              <Descriptions.Item label={t('descriptions.beginTime')}>
                {callDetail?.beginTime ? convertTimeZone(agentDetail?.org?.timezone, callDetail?.beginTime, true) : '-'}
              </Descriptions.Item>
              <Descriptions.Item label={t('descriptions.endTime')}>
                {callDetail?.endTime ? convertTimeZone(agentDetail?.org?.timezone, callDetail?.endTime, true) : '-'}
              </Descriptions.Item>
              <Descriptions.Item label={t('descriptions.ringTime')}>
                {callDetail?.ringTime ? convertTimeZone(agentDetail?.org?.timezone, callDetail?.ringTime, true) : '-'}
              </Descriptions.Item>
              <Descriptions.Item label={t('descriptions.answerTime')}>
                {callDetail?.answerTime
                  ? convertTimeZone(agentDetail?.org?.timezone, callDetail?.answerTime, true)
                  : '-'}
              </Descriptions.Item>
              <Descriptions.Item label={t('descriptions.ringDuration')}>
                {callDetail?.ringDuration !== undefined && callDetail.talkDuration !== null
                  ? `${callDetail.ringDuration}${t('descriptions.seconds')}`
                  : '-'}
              </Descriptions.Item>
              <Descriptions.Item label={t('descriptions.talkDuration')}>
                {callDetail?.talkDuration !== undefined && callDetail.talkDuration !== null
                  ? `${callDetail.talkDuration}${t('descriptions.seconds')}`
                  : '-'}
              </Descriptions.Item>
              <Descriptions.Item label={t('descriptions.totalDuration')}>
                {callDetail?.callDuration !== undefined && callDetail.callDuration !== null
                  ? `${callDetail.callDuration}${t('descriptions.seconds')}`
                  : '-'}
              </Descriptions.Item>
            </Descriptions>

            <Descriptions title={t('descriptions.resultInfo')} column={2} className="mt-4">
              <Descriptions.Item label={t('descriptions.callResult')}>
                {callDetail?.callResult !== undefined && renderRecordType(mainTab)?.callResult[callDetail?.callResult]}
              </Descriptions.Item>
              <Descriptions.Item label={t('descriptions.hangupType')}>
                {callDetail?.hangupType !== undefined && renderRecordType(mainTab)?.hangupType[callDetail?.hangupType]}
              </Descriptions.Item>
              <Descriptions.Item label={t('descriptions.recording')} className="text-center w-full">
                {callDetail?.recordUrl && (
                  <audio controls src={callDetail.recordUrl} className="w-full">
                    {t('descriptions.browserNotSupport')}
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
      label: t('descriptions.agentCallDetail'),
      children: (
        <div className="p-6">
          <Card loading={contentLoading}>
            {agentCallDetail?.map((detail, index) => (
              <div key={index} className={`${index > 0 ? 'mt-8 pt-8 border-t' : ''}`}>
                <Descriptions
                  column={2}
                  colon={false}
                  className="mb-4"
                  title={`${convertTimeZone(agentDetail?.org?.timezone, detail?.beginTime, true)}`}
                >
                  <Descriptions.Item label={t('descriptions.callType')}>
                    {detail.callType !== undefined && renderAgentType()?.callType[detail.callType]}
                  </Descriptions.Item>
                  <Descriptions.Item label={t('descriptions.agent')} labelStyle={{ fontWeight: 500 }}>
                    {detail.agent}
                  </Descriptions.Item>
                  <Descriptions.Item label={t('descriptions.ringTime')} labelStyle={{ fontWeight: 500 }}>
                    {detail?.ringTime ? convertTimeZone(agentDetail?.org?.timezone, detail.ringTime, true) : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label={t('descriptions.answerTime')} labelStyle={{ fontWeight: 500 }}>
                    {detail.answerTime ? convertTimeZone(agentDetail?.org?.timezone, detail?.answerTime, true) : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label={t('descriptions.endTime')} labelStyle={{ fontWeight: 500 }}>
                    {detail.endTime ? convertTimeZone(agentDetail?.org?.timezone, detail.endTime, true) : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label={t('descriptions.talkDuration')} labelStyle={{ fontWeight: 500 }}>
                    {detail.talkDuration !== undefined && detail.talkDuration !== null
                      ? `${detail.talkDuration}${t('descriptions.seconds')}`
                      : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label={t('descriptions.totalDuration')} labelStyle={{ fontWeight: 500 }}>
                    {detail.callDuration !== undefined && detail.callDuration !== null
                      ? `${detail.callDuration}${t('descriptions.seconds')}`
                      : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label={t('descriptions.callResult')} labelStyle={{ fontWeight: 500 }}>
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
      label: t('descriptions.customer'),
      children: (
        <div className="p-6">
          <Card loading={contentLoading}>
            <Descriptions title={t('descriptions.customerInfo')} column={2}>
              <Descriptions.Item label={t('descriptions.customerName')}>-</Descriptions.Item>
              <Descriptions.Item label={t('descriptions.phone')}>{currentCustomer?.phone}</Descriptions.Item>
              <Descriptions.Item label={t('descriptions.sex')}>-</Descriptions.Item>
              <Descriptions.Item label={t('descriptions.mail')}>-</Descriptions.Item>
              <Descriptions.Item label={t('descriptions.platform')}>-</Descriptions.Item>
              <Descriptions.Item label={t('descriptions.remark')}>-</Descriptions.Item>

              {/* <Descriptions.Item label="Begin Time">
                {currentCustomer?.beginTime
                  ? convertTimeZone(
                      agentDetail?.org?.timezone,
                      currentCustomer?.beginTime,
                      true
                    )
                  : '-'}
              </Descriptions.Item> */}
            </Descriptions>
          </Card>
        </div>
      )
    },
    {
      key: 'call',
      label: t('descriptions.callDetail'),
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
      <Spin spinning={contentLoading}>
        <div className="p-4 border-b flex justify-between items-center">
          <h1 className="text-xl font-medium">{currentCustomer?.phone}</h1>
          <Button
            icon={<PhoneOutlined />}
            variant="outlined"
            className="border-gray-300"
            disabled={![2, 6, 7].includes(status)}
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
      </Spin>
    </div>
  )
}

export default MyCallContent
