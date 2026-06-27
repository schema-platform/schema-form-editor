import type { WidgetConfig } from '../base/types'

export const approvalRolePickerConfig: WidgetConfig = {
  name: 'FgApprovalRolePicker',
  displayName: '审批角色',
  description: '审批角色选择器，从 Flow API 获取角色列表',
  author: 'yangdongnan',
  defaultStyle: { width: '240px', height: '40px', fontSize: '14px' },
  defaultProps: {
    placeholder: '请选择审批角色',
    clearable: true,
    disabled: false,
    multiple: false,
    apiBaseUrl: '',
  },
  exposedValues: [
    { key: 'value', type: 'string', description: '选中角色ID', example: '' },
    { key: 'label', type: 'string', description: '选中角色名', example: '' },
  ],
  configPanels: ['events', 'rules', 'variables'],
  propertyPanel: {
    basic: ['field', 'label', 'defaultValue'],
    style: ['fontSize', 'color', 'backgroundColor'],
    props: [
      { key: 'placeholder', label: '占位文字', type: 'input', default: '请选择审批角色' },
      { key: 'clearable', label: '可清空', type: 'switch', default: true },
      { key: 'disabled', label: '禁用', type: 'switch', default: false },
      { key: 'multiple', label: '多选', type: 'switch', default: false },
      { key: 'apiBaseUrl', label: 'Flow API 地址', type: 'input', default: '' },
    ],
  },
}
