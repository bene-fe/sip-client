import {
  DashboardOutlined,
  PhoneOutlined,
  CustomerServiceOutlined,
  MessageOutlined,
  SettingOutlined,
  FileTextOutlined,
  RobotOutlined,
  ScheduleOutlined,
  AudioOutlined,
  FileSearchOutlined,
  ProfileOutlined,
  ToolOutlined,
  TeamOutlined,
  UserOutlined,
  ApiOutlined,
  HistoryOutlined,
  FormOutlined,
  BarsOutlined,
  ContactsOutlined,
  SolutionOutlined,
  BarChartOutlined,
} from '@ant-design/icons'

export const menuIconMap: Record<string, React.ComponentType> = {
  // 主菜单
  '/': DashboardOutlined,
  '/outbound-call': PhoneOutlined,
  '/call-center': CustomerServiceOutlined,
  '/otpmanagement': MessageOutlined,
  '/management-center': SettingOutlined,

  // 外呼机器人
  '/outbound-call-second': RobotOutlined,
  '/outbound-reports': FileSearchOutlined,
  '/call-bot-task': ScheduleOutlined,
  '/call-bot-task-detail': ProfileOutlined,
  '/call-bot-record': AudioOutlined,
  '/call-bot-detail': FileTextOutlined,

  // 自动外呼
  '/auto-call': PhoneOutlined,
  '/auto-call-template': FormOutlined,
  '/auto-call-record': HistoryOutlined,

  // 话术管理
  '/script-management': FileTextOutlined,
  '/my-script': FormOutlined,

  // 呼叫中心
  '/reports': FileSearchOutlined,
  '/outbound-task-reports': BarsOutlined,
  '/agent-outbound-reports': ContactsOutlined,
  '/inbound-reports': BarChartOutlined,

  // 外呼任务
  '/outbound-tasks': ScheduleOutlined,
  '/call-center-outbound-task': ScheduleOutlined,
  '/call-center-task-record': AudioOutlined,

  // 通话记录
  '/call-center-record': AudioOutlined,
  '/call-center-record-page': HistoryOutlined,

  // OTP消息中心
  '/otp-message-center': MessageOutlined,
  '/message-template': FormOutlined,
  '/historical-records': HistoryOutlined,

  // 管理中心
  '/account-management': UserOutlined,
  '/account-infomation': SolutionOutlined,
  '/user-manage': TeamOutlined,
  '/setting': ToolOutlined,
  '/agent-management': TeamOutlined,
  '/callback-settings': ApiOutlined,
  '/my-call': PhoneOutlined,
  '/agent-todo-list': ScheduleOutlined,
}
