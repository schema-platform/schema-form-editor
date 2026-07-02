import { publicSchema } from '../base/publicSchema'
import { complianceChecklistConfig } from './config'
import type { Widget } from '../base/types'

export function createComplianceChecklistWidget(id: string): Widget {
  return {
    ...publicSchema(id, 'compliance-checklist'),
    name: complianceChecklistConfig.name,
    label: complianceChecklistConfig.displayName,
    position: { x: 0, y: 0, w: 480, h: 240, zIndex: 1 },
    style: { ...complianceChecklistConfig.defaultStyle },
    props: { ...complianceChecklistConfig.defaultProps },
  }
}
