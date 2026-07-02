import { publicSchema } from '../base/publicSchema'
import { notificationConfig } from './config'
import type { Widget } from '../base/types'

export function createNotificationWidget(id: string): Widget {
  return {
    ...publicSchema(id, 'notification'),
    name: notificationConfig.name,
    label: notificationConfig.displayName,
    position: { x: 0, y: 0, w: 400, h: 280, zIndex: 1 },
    style: { ...notificationConfig.defaultStyle },
    props: { ...notificationConfig.defaultProps },
  }
}
