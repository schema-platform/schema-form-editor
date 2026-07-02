import type { ChartWidgetMock } from '../base/widgetMock'

/** 柱状图 — 默认 mock（月度申请量） */
export const barChartMock: ChartWidgetMock = {
  kind: 'chart',
  staticData: [
    { category: '1月', value: 42 },
    { category: '2月', value: 38 },
    { category: '3月', value: 55 },
    { category: '4月', value: 48 },
    { category: '5月', value: 62 },
    { category: '6月', value: 57 },
  ],
}
