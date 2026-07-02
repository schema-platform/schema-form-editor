import { describe, it, expect } from 'vitest'
import {
  getWidgetMock,
  getChartStaticDataFromMock,
  getTableRowsFromMock,
  shouldUseWidgetMock,
} from '@/widgets/base/widgetMock'

describe('widgetMock', () => {
  it('shouldUseWidgetMock only on editor surface without API', () => {
    expect(shouldUseWidgetMock('editor', false)).toBe(true)
    expect(shouldUseWidgetMock('editor', true)).toBe(false)
    expect(shouldUseWidgetMock('runtime', false)).toBe(false)
    expect(shouldUseWidgetMock(undefined, false)).toBe(false)
  })

  it('getTableRowsFromMock returns advanced-table rows', () => {
    const result = getTableRowsFromMock('advanced-table')
    expect(result).toBeDefined()
    expect(result!.rows.length).toBeGreaterThan(0)
    expect(result!.total).toBeGreaterThan(0)
    expect(result!.rows[0]).toHaveProperty('applicantName')
  })

  it('getChartStaticDataFromMock returns chart staticData', () => {
    const data = getChartStaticDataFromMock('bar-chart')
    expect(Array.isArray(data)).toBe(true)
    expect(data!.length).toBeGreaterThan(0)
  })

  it('getWidgetMock resolves chart aliases', () => {
    expect(getWidgetMock('stacked-bar-chart')?.kind).toBe('chart')
    expect(getWidgetMock('donut-chart')?.kind).toBe('chart')
  })

  it('getWidgetMock returns statistic and descriptions mocks', () => {
    expect(getWidgetMock('statistic')?.kind).toBe('statistic')
    expect(getWidgetMock('descriptions')?.kind).toBe('record')
  })
})
