import { callOutIcon, callInIcon } from './call-icon'
import { useEffect } from 'react'
import { Input, Pagination, Select, Tag, Space, Tooltip } from 'antd'
import myCallStore from './my-call-store'
import useDialpadStore from '../../components/dialpad/dialpad'
import { SearchOutlined, PhoneOutlined, CheckCircleOutlined, TeamOutlined, BarChartOutlined } from '@ant-design/icons'
import { TaskStatus, TaskStatusLabel, TaskStatusColor } from '../../constants/taskStatus'

// 定义通话状态枚举
enum CallStatus {
  INCOMING_ACTIVE = 0, // 呼入：振铃、通话中
  INCOMING_MISSED = 1, // 呼入：挂断
  OUTGOING_ACTIVE = 2, // 呼出：拨打、通话中
  OUTGOING_FAILED = 3, // 呼出：挂断、呼叫失败
  PENDING = 4 // 待拨打/取消拨打
}

const MyCallSide = () => {
  const {
    mainTab,
    setMainTab,
    subTab,
    setSubTab,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    searchPhone,
    setSearchPhone,
    taskData,
    total,
    loading,
    fetchTaskData,
    setCurrentCustomer,
    selectedRecordId
  } = myCallStore()
  const { groupCallInfo } = useDialpadStore()

  // 监听筛选条件变化
  useEffect(() => {
    fetchTaskData()
  }, [currentPage, pageSize, subTab, searchPhone, mainTab])

  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      const itemHeight = 76
      const availableHeight = window.innerHeight - 100
      setPageSize(Math.max(4, Math.floor(availableHeight / itemHeight)))
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // 添加辅助函数来处理图标和颜色
  const getCallStatusInfo = (status: CallStatus) => {
    switch (status) {
      case CallStatus.INCOMING_ACTIVE:
        return {
          icon: callInIcon('w-8 h-8', 'green')
        }
      case CallStatus.INCOMING_MISSED:
        return {
          icon: callInIcon('w-8 h-8', 'red')
        }
      case CallStatus.OUTGOING_ACTIVE:
        return {
          icon: callOutIcon('w-8 h-8', 'orange')
        }
      case CallStatus.OUTGOING_FAILED:
        return {
          icon: callOutIcon('w-8 h-8', 'red')
        }
      case CallStatus.PENDING:
        return {
          icon: callOutIcon('w-8 h-8', 'gray')
        }
    }
  }

  return (
    <div className="flex flex-col h-full w-[320px]">
      {/* 顶部导航栏 */}
      <div className="flex flex-col border-b flex-none pb-2">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-medium">My Call</h1>
          <div className="flex space-x-4">
            <span
              className={`px-3 py-1 rounded-full cursor-pointer transition-colors ${
                mainTab === 'normal' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => setMainTab('normal')}
            >
              普通外呼
            </span>
            <span
              className={`px-3 py-1 rounded-full cursor-pointer transition-colors ${
                mainTab === 'task' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => setMainTab('task')}
            >
              外呼任务
            </span>
          </div>
        </div>
        <div className="flex justify-end px-4 pb-2">
          <div className="flex space-x-4">
            {mainTab === 'normal' && (
              <span
                className={`px-3 py-1 rounded-full cursor-pointer transition-colors text-sm ${
                  subTab === 'today' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                }`}
                onClick={() => setSubTab('today')}
              >
                今天
              </span>
            )}
            {mainTab === 'task' && (
              <div className="flex space-x-4">
                <span
                  className={`px-3 py-1 rounded-full cursor-pointer transition-colors text-sm ${
                    subTab === 'today' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                  onClick={() => setSubTab('today')}
                >
                  已拨打
                </span>
              </div>
            )}
            <span
              className={`px-3 py-1 rounded-full cursor-pointer transition-colors text-sm ${
                subTab === 'missed' ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => setSubTab('missed')}
            >
              未接
            </span>
          </div>
        </div>
      </div>

      {/* 搜索栏 */}
      <div className="border-b flex flex-col justify-center items-start gap-2">
        <div className="flex items-center p-2">
          <Select className="mr-2" defaultValue="phone" disabled>
            <Select.Option value="phone">电话</Select.Option>
          </Select>
          <Input
            placeholder="搜索"
            prefix={<SearchOutlined />}
            className="flex-1 ml-2"
            value={searchPhone || ''}
            onChange={(e) => setSearchPhone(e.target.value)}
            onPressEnter={fetchTaskData}
          />
        </div>
        {mainTab === 'task' && (
          <div className="p-2 border-b">
            <div className="flex flex-col gap-2">
              <div className="flex items-center">
                <span className="font-medium text-gray-700">外呼任务状态</span>
                {groupCallInfo?.status !== undefined && (
                  <Tag color={TaskStatusColor[groupCallInfo.status as TaskStatus]}>
                    {TaskStatusLabel[groupCallInfo.status as TaskStatus]}
                  </Tag>
                )}
              </div>

              <Space className="mt-1">
                <Tooltip title="总呼叫数">
                  <Tag icon={<PhoneOutlined />} color="blue">
                    总数: {groupCallInfo?.process?.data?.totalCount || 0}
                  </Tag>
                </Tooltip>

                <Tooltip title="客户接听数">
                  <Tag icon={<TeamOutlined />} color="green">
                    接听: {groupCallInfo?.process?.data?.customerAnsweredCount || 0}
                  </Tag>
                </Tooltip>

                <Tooltip title="已完成数">
                  <Tag icon={<CheckCircleOutlined />} color="purple">
                    完成: {groupCallInfo?.process?.data?.completedCount || 0}
                  </Tag>
                </Tooltip>

                {groupCallInfo?.process?.data?.totalCount > 0 && (
                  <Tooltip title="完成率">
                    <Tag icon={<BarChartOutlined />} color="orange">
                      {Math.round(
                        ((groupCallInfo?.process?.data?.completedCount || 0) /
                          (groupCallInfo?.process?.data?.totalCount || 1)) *
                          100
                      )}
                      %
                    </Tag>
                  </Tooltip>
                )}
              </Space>
            </div>
          </div>
        )}
      </div>

      {/* 通话记录列表 */}
      <div className="flex-1 overflow-y-auto min-h-0 flex flex-col">
        <div className="flex-1">
          {taskData.map((record) => {
            const statusInfo = getCallStatusInfo(record.status as CallStatus)

            return (
              <div
                key={record.uuid}
                className={`flex items-center p-3 border-b hover:bg-gray-100 cursor-pointer select-none overflow-hidden ${
                  selectedRecordId === record.uuid ? 'bg-blue-50' : ''
                }`}
                onClick={() => setCurrentCustomer(record)}
              >
                <div className="w-8 h-8 mr-3 flex-none">
                  <div className="w-full h-full rounded-full flex items-center justify-center">
                    <span className="text-xl">{statusInfo.icon}</span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <span className={`font-medium truncate ${selectedRecordId === record.uuid ? 'text-blue-700' : ''}`}>
                      {record.uuid}
                    </span>
                    <span className="text-gray-500 text-sm flex-none ml-2">{record.beginTime}</span>
                  </div>
                  <div
                    className={`text-sm truncate ${selectedRecordId === record.uuid ? 'text-blue-600' : 'text-gray-500'}`}
                  >
                    {record.phone}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <div className="p-4 border-t flex-none">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={total}
            onChange={setCurrentPage}
            size="small"
            showSizeChanger={false}
          />
        </div>
      </div>

      {/* 暂无通话提示 */}
      {!loading && taskData.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">📞</div>
          <span>暂无通话</span>
        </div>
      )}
    </div>
  )
}

export default MyCallSide
