import { publicSchema } from '../base/publicSchema'
import { treeLayoutConfig } from './config'
import type { Widget } from '../base/types'

export function createTreeLayoutWidget(id: string): Widget {
  return {
    ...publicSchema(id, 'tree-layout'),
    name: treeLayoutConfig.name,
    label: treeLayoutConfig.displayName,
    position: { x: 0, y: 0, w: 100, h: 200, wUnit: '%', zIndex: 1 },
    style: { ...treeLayoutConfig.defaultStyle },
    props: { ...treeLayoutConfig.defaultProps },
    children: [],
  }
}
