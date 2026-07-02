import type { StatisticWidgetMock } from '../base/widgetMock'

/** 统计卡片 — 默认 mock（工作台 KPI） */
export const statisticMock: StatisticWidgetMock = {
  kind: 'statistic',
  defaultProps: {
    title: '待我审批',
    value: 12,
    prefix: '',
    suffix: '件',
    precision: 0,
    trend: 'up',
    trendValue: '较昨日 +3',
    color: '#409EFF',
  },
}
