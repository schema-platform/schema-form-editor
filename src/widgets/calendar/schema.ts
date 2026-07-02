import { publicSchema } from '../base/publicSchema'
import { calendarConfig } from './config'
import type { Widget } from '../base/types'

export function createCalendarWidget(id: string): Widget {
  return {
    ...publicSchema(id, 'calendar'),
    name: calendarConfig.name,
    label: calendarConfig.displayName,
    position: { x: 0, y: 0, w: 480, h: 360, zIndex: 1 },
    style: { ...calendarConfig.defaultStyle },
    props: { ...calendarConfig.defaultProps },
  }
}
