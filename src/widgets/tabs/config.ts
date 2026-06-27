import type { WidgetConfig } from '../base/types'
export const tabsConfig: WidgetConfig = {
  name: 'FgTabs',
  displayName: '页签容器',
  description: '页签容器，支持动态增删标签页，组件绑定到指定标签',
  author: 'yangdongnan',
  defaultPosition: { w: 100, wUnit: '%', h: 200 },
  defaultStyle: {
    width: '100%',
  },
  exposedValues: [
    { key: 'activeKey', type: 'string', description: '当前激活标签' },
  ],
  eventTargets: [
    { id: 'tab-change', label: '标签切换', description: '切换标签时触发' },
    { id: 'tab-close', label: '标签关闭', description: '关闭标签时触发' },
    { id: 'tab-add', label: '标签新增', description: '新增标签时触发' },
  ],
  configPanels: ['events', 'variables'],
  defaultProps: {
    tabs: [
      { key: 'tab1', label: '标签一' },
      { key: 'tab2', label: '标签二' },
    ],
    activeKey: 'tab1',
    type: 'border-card' as const,
    tabPosition: 'top' as const,
  },
  propertyPanel: {
    basic: [
      {
        key: 'type',
        label: '风格类型',
        type: 'select',
        options: [
          { label: '默认', value: '' },
          { label: '卡片', value: 'card' },
          { label: '边框卡片', value: 'border-card' },
        ],
        default: 'border-card',
      },
      {
        key: 'tabPosition',
        label: '标签位置',
        type: 'select',
        options: [
          { label: '顶部', value: 'top' },
          { label: '右侧', value: 'right' },
          { label: '底部', value: 'bottom' },
          { label: '左侧', value: 'left' },
        ],
        default: 'top',
      },
      {
        key: 'closable',
        label: '可关闭',
        type: 'switch',
        default: false,
      },
      {
        key: 'addable',
        label: '可新增',
        type: 'switch',
        default: false,
      },
      {
        key: 'stretch',
        label: '自适应宽度',
        type: 'switch',
        default: false,
      },
    ],
    style: ['margin', 'padding', 'width', 'height'],
    props: [
      {
        key: 'tabs',
        label: '页签',
        type: 'array-editor',
        fields: [
          { key: 'key', label: '标识', type: 'text', placeholder: 'tab1' },
          { key: 'label', label: '标签', type: 'text', placeholder: '标签名' },
        ],
      },
      {
        key: 'activeKey',
        label: '默认激活',
        type: 'text',
        default: '',
        placeholder: 'tab1',
      },
    ],
  },
}
