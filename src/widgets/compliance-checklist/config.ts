import type { WidgetConfig } from '../base/types'

export const complianceChecklistConfig: WidgetConfig = {
  name: 'FgComplianceChecklist',
  displayName: '合规检查表',
  description: '整改合规检查清单（E-17）',
  author: 'yangdongnan',
  defaultStyle: { width: '100%', backgroundColor: '#fff', borderRadius: '8px', padding: '16px' },
  exposedValues: [
    { key: 'checkedItems', type: 'object', description: '已勾选项' },
    { key: 'remark', type: 'string', description: '备注' },
  ],
  configPanels: ['events'],
  defaultProps: {
    title: '合规检查',
    items: [
      { key: 'item1', label: '检查项 1' },
      { key: 'item2', label: '检查项 2' },
    ],
  },
  propertyPanel: {
    basic: ['label'],
    props: [{ key: 'title', label: '标题', type: 'input', default: '合规检查' }],
  },
}
