import { Radio, Input, Button, Form, message } from 'antd'
import { queryCallSummary, addCallSummary } from '../../api/agent-seat'
import { useEffect } from 'react'
import myCallStore from './my-call-store'

const { TextArea } = Input

const CallSummary = () => {
  const { currentCustomer, callDetail, mainTab } = myCallStore()

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
        message.success('保存成功')
      }
    })
  }

  return (
    <div className="p-6 min-w-[280px]">
      <h2 className="text-lg font-medium mb-6">通话总结</h2>
      {currentCustomer && (
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label={
              <span>
                处理进度 <span className="text-red-500">*</span>
              </span>
            }
            name="status"
            rules={[{ required: true, message: '请选择处理进度' }]}
          >
            <Radio.Group>
              <Radio value={1}>待处理</Radio>
              <Radio value={2}>已处理</Radio>
              <Radio value={3}>无法处理</Radio>
              <Radio value={4}>无效</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item label="备注" name="remark">
            <TextArea placeholder="请输入" autoSize={{ minRows: 4, maxRows: 6 }} />
          </Form.Item>

          <Form.Item>
            <div className="flex space-x-4">
              <Button type="primary" htmlType="submit">
                保存
              </Button>
              <Button onClick={() => form.resetFields()}>取消</Button>
            </div>
          </Form.Item>
        </Form>
      )}
    </div>
  )
}

export default CallSummary
