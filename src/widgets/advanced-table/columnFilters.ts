import type { AdvancedTableColumn } from './config'
import { getRowCellValue } from './tableRowValue'

export type ColumnFilter = { text: string; value: unknown }

export function buildFiltersFromOptions(
  options: Array<{ label: string; value: unknown }>,
): ColumnFilter[] {
  return options.map(o => ({ text: o.label, value: o.value }))
}

export function buildFiltersFromDistinctRows(
  rows: Record<string, unknown>[],
  prop: string,
): ColumnFilter[] {
  const seen = new Set<string>()
  const filters: ColumnFilter[] = []
  for (const row of rows) {
    const val = getRowCellValue(row, prop)
    if (val === undefined || val === null) continue
    const key = String(val)
    if (seen.has(key)) continue
    seen.add(key)
    filters.push({ text: key, value: val })
  }
  return filters.sort((a, b) => String(a.text).localeCompare(String(b.text)))
}

/** 解析列筛选选项：filterable 关闭返回 undefined；有显式 filters 优先；否则从 options 或行数据去重生成 */
export function resolveColumnFilters(
  col: AdvancedTableColumn,
  rows: Record<string, unknown>[],
): ColumnFilter[] | undefined {
  if (!col.filterable) return undefined
  if (col.filters?.length) return col.filters
  if (col.options?.length) return buildFiltersFromOptions(col.options)
  if (!col.prop) return undefined
  const fromRows = buildFiltersFromDistinctRows(rows, col.prop)
  return fromRows.length > 0 ? fromRows : undefined
}
