import type { ChartWidgetMock } from '../base/widgetMock'

/** 折线图 — 默认 mock（审批趋势） */
export const lineChartMock: ChartWidgetMock = {
  kind: 'chart',
  staticData: [
    { category: '周一', value: 12 },
    { category: '周二', value: 18 },
    { category: '周三', value: 15 },
    { category: '周四', value: 22 },
    { category: '周五', value: 19 },
    { category: '周六', value: 8 },
    { category: '周日', value: 5 },
  ],
}
