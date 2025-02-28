/**
 * 任务状态枚举
 */
export enum TaskStatus {
  TO_BE_STARTED = 1,
  IN_PROGRESS = 2,
  COMPLETED = 3,
  PAUSE = 4,
  RESTING = 5,
  CANCELED = 6
}

/**
 * 任务状态中文描述
 */
export const TaskStatusLabel: Record<TaskStatus, string> = {
  [TaskStatus.TO_BE_STARTED]: '待开始',
  [TaskStatus.IN_PROGRESS]: '进行中',
  [TaskStatus.COMPLETED]: '已完成',
  [TaskStatus.PAUSE]: '暂停中',
  [TaskStatus.RESTING]: '休息中',
  [TaskStatus.CANCELED]: '已取消'
}

/**
 * 任务状态英文标签
 */
export const TaskStatusEnLabel: Record<TaskStatus, string> = {
  [TaskStatus.TO_BE_STARTED]: 'TO_BE_STARTED',
  [TaskStatus.IN_PROGRESS]: 'IN_PROGRESS',
  [TaskStatus.COMPLETED]: 'COMPLETED',
  [TaskStatus.PAUSE]: 'PAUSE',
  [TaskStatus.RESTING]: 'RESTING',
  [TaskStatus.CANCELED]: 'CANCELED'
}

/**
 * 任务状态颜色
 */
export const TaskStatusColor: Record<TaskStatus, string> = {
  [TaskStatus.TO_BE_STARTED]: 'blue',
  [TaskStatus.IN_PROGRESS]: 'green',
  [TaskStatus.COMPLETED]: 'gray',
  [TaskStatus.PAUSE]: 'yellow',
  [TaskStatus.RESTING]: 'orange',
  [TaskStatus.CANCELED]: 'red'
}
