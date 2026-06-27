import type { WidgetConfig } from '../base/types'

export const approvalCommentConfig: WidgetConfig = {
  name: 'FgApprovalComment',
  displayName: '审批意见',
  description: '审批意见输入框',
  author: 'yangdongnan',
  defaultStyle: { width: '100%', height: '120px', fontSize: '14px' },
  defaultProps: {
    placeholder: '请输入审批意见',
    rows: 4,
    maxlength: 1000,
    showWordLimit: true,
    clearable: true,
    disabled: false,
  },
  exposedValues: [
    { key: 'value', type: 'string', description: '输入的审批意见', example: '' },
  ],
  configPanels: ['events', 'rules', 'variables'],
  propertyPanel: {
    basic: ['field', 'label', 'defaultValue'],
    style: ['fontSize', 'color', 'backgroundColor'],
    props: [
      { key: 'placeholder', label: '占位文字', type: 'input', default: '请输入审批意见' },
      { key: 'rows', label: '行数', type: 'number', default: 4 },
      { key: 'maxlength', label: '最大字数', type: 'number', default: 1000 },
      { key: 'showWordLimit', label: '显示字数', type: 'switch', default: true },
      { key: 'required', label: '必填', type: 'switch', default: false },
    ],
  },
}
