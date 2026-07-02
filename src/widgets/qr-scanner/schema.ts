import { publicSchema } from '../base/publicSchema'
import { qrScannerConfig } from './config'
import type { Widget } from '../base/types'

export function createQrScannerWidget(id: string): Widget {
  return {
    ...publicSchema(id, 'qr-scanner'),
    name: qrScannerConfig.name,
    label: qrScannerConfig.displayName,
    formId: 'form_main',
    field: 'scanCode',
    position: { x: 0, y: 0, w: 400, h: 80, zIndex: 1 },
    style: { ...qrScannerConfig.defaultStyle },
    props: { ...qrScannerConfig.defaultProps },
  }
}
