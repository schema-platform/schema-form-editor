import { nanoid } from 'nanoid'
import type { Widget } from '../base/types'

export function createApprovalCommentWidget(id?: string): Widget {
  return {
    id: id ?? nanoid(),
    type: 'approval-comment',
    field: 'approvalComment',
    label: '审批意见',
    props: { placeholder: '请输入审批意见', rows: 4, maxlength: 1000, showWordLimit: true },
    style: { width: '100%', height: '120px', fontSize: '14px' },
    children: [],
  }
}
