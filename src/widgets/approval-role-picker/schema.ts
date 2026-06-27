import { nanoid } from 'nanoid'
import type { Widget } from '../base/types'

export function createApprovalRolePickerWidget(id?: string): Widget {
  return {
    id: id ?? nanoid(),
    type: 'approval-role-picker',
    field: 'approvalRole',
    label: '审批角色',
    props: { placeholder: '请选择审批角色', clearable: true, multiple: false, apiBaseUrl: '' },
    style: { width: '240px', height: '40px', fontSize: '14px' },
    children: [],
  }
}
