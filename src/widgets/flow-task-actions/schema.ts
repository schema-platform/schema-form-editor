import { publicSchema } from '../base/publicSchema'
import { flowTaskActionsConfig } from './config'
import type { Widget } from '../base/types'

export function createFlowTaskActionsWidget(id: string): Widget {
  return {
    ...publicSchema(id, 'flow-task-actions'),
    name: flowTaskActionsConfig.name,
    label: flowTaskActionsConfig.displayName,
    position: { x: 0, y: 0, w: 600, h: 200, zIndex: 1 },
    style: { ...flowTaskActionsConfig.defaultStyle },
    props: { ...flowTaskActionsConfig.defaultProps },
  }
}
