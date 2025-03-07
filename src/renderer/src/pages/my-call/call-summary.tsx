import { Radio, Input, Button, Form, message, Spin } from 'antd'
import { queryCallSummary, addCallSummary } from '../../api/agent-seat'
import { useEffect } from 'react'
import myCallStore from './my-call-store'
import { useTranslation } from 'react-i18next'

const { TextArea } = Input

const CallSummary = () => {
  const { t } = useTranslation()
  const { currentCustomer, callDetail, mainTab, loading } = myCallStore()

  const renderRecordType = (mainTab: string, dialType: number): any => {
    if (mainTab === 'task') {
      return 'GROUP_CALL'
    } else {
      return {
        1: 'OUTBOUND_CALL',
        2: 'INBOUND_CALL',
        3: 'GROUP_CALL'
      }[dialType]
    }
  }

  const handleQueryCallSummary = () => {
    if (currentCustomer) {
      queryCallSummary(currentCustomer.uuid).then((res: any) => {
        if (res.code === 0 && res.data) {
          form.setFieldsValue({
            status: res.data.status,
            remark: res.data.remark,
            callUuid: res.data.callUuid,
            callType: res.data.callType
          })
        } else {
          form.resetFields()
        }
      })
    }
  }

  useEffect(() => {
    handleQueryCallSummary()
  }, [currentCustomer])

  const [form] = Form.useForm()

  const onFinish = (values: any) => {
    if (callDetail?.dialType) {
      values.callType = renderRecordType(mainTab, Number(callDetail?.dialType))
    }
    values.callUuid = currentCustomer?.uuid

    addCallSummary(values).then((res: any) => {
      if (res.code === 0) {
        message.success(t('callSummary.saveSuccess'))
      }
    })
  }

  return (
    <div className="p-6 min-w-[280px]">
      <Spin spinning={loading}>
        <h2 className="text-lg font-medium mb-6">{t('callSummary.title')}</h2>
        {currentCustomer && (
          <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item
              label={
                <span>
                  {t('callSummary.status')} <span className="text-red-500">*</span>
                </span>
              }
              name="status"
              rules={[{ required: true, message: t('callSummary.statusRequired') }]}
            >
              <Radio.Group>
                <Radio value={1}>{t('callSummary.pending')}</Radio>
                <Radio value={2}>{t('callSummary.processed')}</Radio>
                <Radio value={3}>{t('callSummary.unprocessable')}</Radio>
                <Radio value={4}>{t('callSummary.invalid')}</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item label={t('callSummary.remark')} name="remark">
              <TextArea placeholder={t('callSummary.remarkPlaceholder')} autoSize={{ minRows: 4, maxRows: 6 }} />
            </Form.Item>

            <Form.Item>
              <div className="flex space-x-4">
                <Button type="primary" htmlType="submit">
                  {t('callSummary.save')}
                </Button>
                <Button onClick={() => form.resetFields()}>{t('callSummary.cancel')}</Button>
              </div>
            </Form.Item>
          </Form>
        )}
      </Spin>
    </div>
  )
}

export default CallSummary
