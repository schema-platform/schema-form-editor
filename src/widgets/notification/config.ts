import type { WidgetConfig } from '../base/types'
import { notificationMock } from './mock'

export const notificationConfig: WidgetConfig = {
  name: 'FgNotification',
  displayName: '通知公告',
  description: '展示已发布公告列表（E-08）',
  author: 'yangdongnan',
  defaultStyle: { width: '100%', backgroundColor: '#fff', borderRadius: '8px', padding: '12px' },
  exposedValues: [{ key: 'items', type: 'array', description: '公告列表' }],
  configPanels: ['events', 'variables'],
  defaultProps: {
    title: '最新公告',
    pageSize: 5,
    staticData: notificationMock.staticData.items,
  },
  propertyPanel: {
    basic: ['label'],
    style: ['margin', 'padding'],
    props: [
      { key: 'title', label: '标题', type: 'input', default: '最新公告' },
      { key: 'pageSize', label: '条数', type: 'number', default: 5 },
    ],
  },
}
