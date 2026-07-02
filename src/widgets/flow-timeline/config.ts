import type { WidgetConfig } from '../base/types'
import { flowTimelineMock } from './mock'

export const flowTimelineConfig: WidgetConfig = {
  name: 'FgFlowTimeline',
  displayName: '流程轨迹',
  description: '展示流程实例审批时间线（E-01）',
  author: 'yangdongnan',
  defaultStyle: { width: '100%', backgroundColor: '#fff', borderRadius: '8px', padding: '16px' },
  exposedValues: [
    { key: 'logs', type: 'array', description: '审批日志列表' },
    { key: 'loading', type: 'boolean', description: '加载状态' },
  ],
  configPanels: ['events', 'variables'],
  defaultProps: {
    title: '审批记录',
    instanceIdVariable: 'flowInstanceId',
    staticData: flowTimelineMock.staticData.logs,
  },
  propertyPanel: {
    basic: ['label'],
    style: ['margin', 'padding'],
    props: [
      { key: 'title', label: '标题', type: 'input', default: '审批记录' },
      { key: 'instanceIdVariable', label: '实例 ID 变量名', type: 'input', default: 'flowInstanceId' },
      { key: 'instanceId', label: '固定实例 ID', type: 'input', desc: '留空则从 board 变量读取' },
    ],
  },
}
