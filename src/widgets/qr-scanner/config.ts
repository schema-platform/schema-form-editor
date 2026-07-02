import type { WidgetConfig } from '../base/types'

export const qrScannerConfig: WidgetConfig = {
  name: 'FgQrScanner',
  displayName: '扫码录入',
  description: '条码/二维码扫描绑定字段（E-19）',
  author: 'yangdongnan',
  defaultStyle: { width: '100%' },
  exposedValues: [{ key: 'value', type: 'string', description: '扫码结果' }],
  configPanels: ['events'],
  defaultProps: { label: '扫码录入' },
  propertyPanel: {
    basic: ['label', 'field'],
    props: [{ key: 'label', label: '标签', type: 'input', default: '扫码录入' }],
  },
}
