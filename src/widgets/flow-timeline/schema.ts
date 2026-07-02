import { publicSchema } from '../base/publicSchema'
import { flowTimelineConfig } from './config'
import type { Widget } from '../base/types'

export function createFlowTimelineWidget(id: string): Widget {
  return {
    ...publicSchema(id, 'flow-timeline'),
    name: flowTimelineConfig.name,
    label: flowTimelineConfig.displayName,
    position: { x: 0, y: 0, w: 600, h: 320, zIndex: 1 },
    style: { ...flowTimelineConfig.defaultStyle },
    props: { ...flowTimelineConfig.defaultProps },
  }
}
