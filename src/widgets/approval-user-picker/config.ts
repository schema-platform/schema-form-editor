import type { WidgetConfig } from '../base/types'

export const approvalUserPickerConfig: WidgetConfig = {
  name: 'FgApprovalUserPicker',
  displayName: '审批用户',
  description: '审批用户选择器，从 Flow API 获取用户列表',
  author: 'yangdongnan',
  defaultStyle: { width: '240px', height: '40px', fontSize: '14px' },
  defaultProps: {
    placeholder: '请选择审批人',
    clearable: true,
    disabled: false,
    multiple: false,
    apiBaseUrl: '',
  },
  exposedValues: [
    { key: 'value', type: 'string', description: '选中用户ID', example: '' },
    { key: 'label', type: 'string', description: '选中用户名', example: '' },
  ],
  configPanels: ['events', 'rules', 'variables'],
  propertyPanel: {
    basic: ['field', 'label', 'defaultValue'],
    style: ['fontSize', 'color', 'backgroundColor'],
    props: [
      { key: 'placeholder', label: '占位文字', type: 'input', default: '请选择审批人' },
      { key: 'clearable', label: '可清空', type: 'switch', default: true },
      { key: 'disabled', label: '禁用', type: 'switch', default: false },
      { key: 'multiple', label: '多选', type: 'switch', default: false },
      { key: 'apiBaseUrl', label: 'Flow API 地址', type: 'input', default: '' },
    ],
  },
}
