import type { WidgetConfig } from '../base/types'
import { dynamicDetailTableMock } from './mock'

export interface DetailColumn {
  prop: string
  label: string
  type?: 'input' | 'number' | 'select'
  width?: number
}

export const dynamicDetailTableConfig: WidgetConfig = {
  name: 'FgDynamicDetailTable',
  displayName: '动态明细表',
  description: '可增删行的费用/采购明细（E-15）',
  author: 'yangdongnan',
  defaultStyle: { width: '100%', backgroundColor: '#fff', borderRadius: '8px', padding: '12px' },
  exposedValues: [{ key: 'rows', type: 'array', description: '明细行数据' }],
  configPanels: ['events', 'variables'],
  defaultProps: {
    title: '费用明细',
    field: 'items',
    columns: dynamicDetailTableMock.defaultProps.columns,
    staticData: dynamicDetailTableMock.staticData.rows,
  },
  propertyPanel: {
    basic: ['label'],
    style: ['margin', 'padding'],
    props: [
      { key: 'title', label: '标题', type: 'input', default: '费用明细' },
      { key: 'field', label: '绑定字段', type: 'input', default: 'items' },
    ],
  },
}
