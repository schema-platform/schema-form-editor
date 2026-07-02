import type { WidgetConfig } from '../base/types'
import { calendarMock } from './mock'

export const calendarConfig: WidgetConfig = {
  name: 'FgCalendar',
  displayName: '日历',
  description: '日程/会议日历展示（E-05）',
  author: 'yangdongnan',
  defaultStyle: { width: '100%', backgroundColor: '#fff', borderRadius: '8px', padding: '12px' },
  exposedValues: [{ key: 'events', type: 'array', description: '日程事件列表' }],
  configPanels: ['events', 'variables'],
  defaultProps: {
    title: '日程日历',
    staticData: calendarMock.staticData.events,
  },
  propertyPanel: {
    basic: ['label'],
    style: ['margin', 'padding'],
    props: [
      { key: 'title', label: '标题', type: 'input', default: '日程日历' },
    ],
  },
}
