import { publicSchema } from '../base/publicSchema'
import { dynamicDetailTableConfig } from './config'
import type { Widget } from '../base/types'

export function createDynamicDetailTableWidget(id: string): Widget {
  return {
    ...publicSchema(id, 'dynamic-detail-table'),
    name: dynamicDetailTableConfig.name,
    label: dynamicDetailTableConfig.displayName,
    formId: 'form_main',
    field: 'items',
    position: { x: 0, y: 0, w: 720, h: 280, zIndex: 1 },
    style: { ...dynamicDetailTableConfig.defaultStyle },
    props: { ...dynamicDetailTableConfig.defaultProps },
  }
}
