import type { WidgetConfig } from '../base/types'

export const fileListConfig: WidgetConfig = {
  name: 'FgFileList',
  displayName: '文件列表',
  description: '文件列表组件，支持文件预览和删除',
  author: 'yangdongnan',
  defaultStyle: { width: '100%' },
  exposedValues: [
    { key: 'value', type: 'array', description: '文件列表数据' },
  ],
  eventTargets: [
    { id: 'delete', label: '删除文件', description: '删除文件时触发' },
    { id: 'preview', label: '预览文件', description: '预览文件时触发' },
  ],
  configPanels: ['events', 'api', 'variables'],
  defaultProps: {
    title: '附件',
    allowDelete: true,
    allowPreview: true,
  },
  propertyPanel: {
    basic: ['label'],
    style: [],
    props: [
      { key: 'title', label: '标题', type: 'input', default: '附件' },
    ],
  },
}
