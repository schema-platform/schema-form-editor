import type { WidgetConfig } from '../base/types'

export const flowTaskActionsConfig: WidgetConfig = {
  name: 'FgFlowTaskActions',
  displayName: '流程任务操作',
  description: '审批通过/驳回/委派操作区（E-02）',
  author: 'yangdongnan',
  defaultStyle: { width: '100%' },
  exposedValues: [
    { key: 'taskId', type: 'string', description: '当前任务 ID' },
    { key: 'loading', type: 'boolean', description: '操作进行中' },
  ],
  configPanels: ['events', 'variables'],
  defaultProps: {
    title: '审批操作',
    taskIdVariable: 'taskId',
    instanceIdVariable: 'flowInstanceId',
    commentWidgetId: 'detail-comment',
    showAiSuggestion: true,
  },
  propertyPanel: {
    basic: ['label'],
    style: ['margin', 'padding'],
    props: [
      { key: 'title', label: '标题', type: 'input', default: '审批操作' },
      { key: 'taskIdVariable', label: '任务 ID 变量', type: 'input', default: 'taskId' },
      { key: 'instanceIdVariable', label: '实例 ID 变量', type: 'input', default: 'flowInstanceId' },
      { key: 'commentWidgetId', label: '意见 Widget ID', type: 'input', default: 'detail-comment' },
      { key: 'showAiSuggestion', label: '显示 AI 建议', type: 'switch', default: true },
    ],
  },
}
