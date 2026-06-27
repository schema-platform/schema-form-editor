import { nanoid } from 'nanoid'
import type { Widget } from '../base/types'

export function createApprovalUserPickerWidget(id?: string): Widget {
  return {
    id: id ?? nanoid(),
    type: 'approval-user-picker',
    field: 'approver',
    label: '审批人',
    props: { placeholder: '请选择审批人', clearable: true, multiple: false, apiBaseUrl: '' },
    style: { width: '240px', height: '40px', fontSize: '14px' },
    children: [],
  }
}
