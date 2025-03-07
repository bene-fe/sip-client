import { PageContainer } from '@ant-design/pro-components'
import MyCallContent from './content'
import MyCallSide from './side'
import CallSummary from './call-summary'
import myCallStore from './my-call-store'
import { Empty } from 'antd'
import useDialpad from '../../components/dialpad/dialpad'
import { useEffect } from 'react'

const MyCall = () => {
  const { currentCustomer, fetchTaskData } = myCallStore()
  const { reloadCallRecord } = useDialpad()

  useEffect(() => {
    fetchTaskData()
  }, [reloadCallRecord])

  return (
    <PageContainer
      header={{
        title: null,
        children: <div className="h-0 w-0 p-0" />,
        childrenContentStyle: {
          padding: 0,
          height: 0,
          overflow: 'hidden',
          display: 'none',
          width: 0,
          margin: 0
        },
        style: {
          height: 0,
          padding: 0,
          width: 0,
          overflow: 'hidden',
          margin: 0
        }
      }}
    >
      <div className="flex flex-row">
        <div className="border-r border-gray-300 pr-4">
          <MyCallSide />
        </div>
        {currentCustomer ? (
          <div className="flex-1 pl-4 border-r border-gray-300 pr-4">
            <MyCallContent className="flex-1" />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center pl-4">
            <Empty description="暂无通话" />
          </div>
        )}
        <CallSummary />
      </div>
    </PageContainer>
  )
}

export default MyCall
