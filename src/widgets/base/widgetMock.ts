/**
 * Widget Mock 数据注册表
 *
 * 复杂部件在 widgets/{name}/mock.ts 定义默认可视化数据，
 * 设计器画布（无 API）下用于预览，PublishView 运行时无 API 则不展示 mock。
 */
import type { InjectionKey } from 'vue'
import { advancedTableMock } from '../advanced-table/mock'
import { barChartMock } from '../bar-chart/mock'
import { lineChartMock } from '../line-chart/mock'
import { pieChartMock } from '../pie-chart/mock'
import { statisticMock } from '../statistic/mock'
import { descriptionsMock } from '../descriptions/mock'

/** 渲染表面：editor=设计器画布，runtime=PublishView/正式运行时 */
export type WidgetSurface = 'editor' | 'runtime'

export const WIDGET_SURFACE_KEY: InjectionKey<WidgetSurface> = Symbol('widgetSurface')

/** 表格类 mock */
export interface TableWidgetMock {
  kind: 'table'
  rows: Record<string, unknown>[]
  total?: number
}

/** 图表类 mock（对应 props.staticData） */
export interface ChartWidgetMock {
  kind: 'chart'
  staticData: Record<string, unknown>[]
}

/** 键值/详情类 mock */
export interface RecordWidgetMock {
  kind: 'record'
  staticData: Record<string, unknown>
}

/** 统计卡片 mock */
export interface StatisticWidgetMock {
  kind: 'statistic'
  defaultProps: Record<string, unknown>
}

export type WidgetMockBundle =
  | TableWidgetMock
  | ChartWidgetMock
  | RecordWidgetMock
  | StatisticWidgetMock

/** 需要 mock.ts 的复杂部件类型（新增时在此登记） */
export const COMPLEX_WIDGET_MOCK_TYPES = [
  'advanced-table',
  'table',
  'bar-chart',
  'stacked-bar-chart',
  'horizontal-bar-chart',
  'line-chart',
  'area-chart',
  'pie-chart',
  'donut-chart',
  'scatter-chart',
  'bubble-chart',
  'radar',
  'filled-radar',
  'gauge',
  'multi-gauge',
  'heatmap',
  'funnel',
  'compare-funnel',
  'candlestick',
  'statistic',
  'descriptions',
  'user-management',
  'role-management',
] as const

export type ComplexWidgetMockType = (typeof COMPLEX_WIDGET_MOCK_TYPES)[number]

const MOCK_REGISTRY: Partial<Record<string, WidgetMockBundle>> = {
  'advanced-table': advancedTableMock,
  'bar-chart': barChartMock,
  'stacked-bar-chart': barChartMock,
  'horizontal-bar-chart': barChartMock,
  'line-chart': lineChartMock,
  'area-chart': lineChartMock,
  'pie-chart': pieChartMock,
  'donut-chart': pieChartMock,
  statistic: statisticMock,
  descriptions: descriptionsMock,
}

export function getWidgetMock(type: string): WidgetMockBundle | undefined {
  return MOCK_REGISTRY[type]
}

export function shouldUseWidgetMock(
  surface: WidgetSurface | undefined,
  hasApiUrl: boolean,
): boolean {
  return surface === 'editor' && !hasApiUrl
}

export function getChartStaticDataFromMock(type: string): Record<string, unknown>[] | undefined {
  const mock = getWidgetMock(type)
  if (mock?.kind === 'chart') return mock.staticData
  return undefined
}

export function getTableRowsFromMock(type: string): { rows: Record<string, unknown>[]; total: number } | undefined {
  const mock = getWidgetMock(type)
  if (mock?.kind !== 'table') return undefined
  const total = mock.total ?? mock.rows.length
  return { rows: mock.rows, total }
}
