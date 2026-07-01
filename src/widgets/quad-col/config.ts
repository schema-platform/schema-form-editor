import type { WidgetConfig } from '../base/types'

export const quadColConfig: WidgetConfig = {
  name: 'FgQuadCol',
  displayName: '四列容器',
  description: '四列布局容器，每列可放置 1 个组件',
  author: 'yangdongnan',
  defaultPosition: { w: 100, wUnit: '%', h: 200 },
  defaultStyle: {},
  configPanels: ['events', 'variables'],
  defaultProps: {
    gutter: 16,
    colWidths: [0, 0, 0, 0],
    colWidthUnit: 'px',
  },
  propertyPanel: {
    basic: [
      { key: 'gutter', label: '列间距', type: 'number', default: 16 },
      {
        key: 'colWidths',
        label: '列宽(px，0=自适应)',
        type: 'number-array',
      },
    ],
    style: ['margin', 'padding'],
    props: [],
  },
}
