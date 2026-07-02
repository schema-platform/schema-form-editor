import { describe, it, expect } from 'vitest'
import {
  buildFiltersFromOptions,
  buildFiltersFromDistinctRows,
  resolveColumnFilters,
} from '../columnFilters'
import type { AdvancedTableColumn } from '../config'

describe('columnFilters', () => {
  describe('buildFiltersFromOptions', () => {
    it('maps label/value to text/value', () => {
      const filters = buildFiltersFromOptions([
        { label: '审批中', value: 'submitted' },
        { label: '已通过', value: 'approved' },
      ])
      expect(filters).toEqual([
        { text: '审批中', value: 'submitted' },
        { text: '已通过', value: 'approved' },
      ])
    })
  })

  describe('buildFiltersFromDistinctRows', () => {
    it('deduplicates values from rows', () => {
      const rows = [
        { status: 'submitted' },
        { status: 'approved' },
        { status: 'submitted' },
      ]
      const filters = buildFiltersFromDistinctRows(rows, 'status')
      expect(filters).toHaveLength(2)
      expect(filters.map(f => f.value)).toEqual(['approved', 'submitted'])
    })

    it('supports nested prop paths', () => {
      const rows = [
        { data: { leaveType: 'annual' } },
        { data: { leaveType: 'sick' } },
        { data: { leaveType: 'annual' } },
      ]
      const filters = buildFiltersFromDistinctRows(rows, 'data.leaveType')
      expect(filters).toHaveLength(2)
      expect(filters.map(f => f.value)).toEqual(['annual', 'sick'])
    })
  })

  describe('resolveColumnFilters', () => {
    const baseCol: AdvancedTableColumn = {
      prop: 'status',
      label: '状态',
      render: 'text',
    }

    it('returns undefined when filterable is false', () => {
      expect(resolveColumnFilters(baseCol, [{ status: 'a' }])).toBeUndefined()
    })

    it('returns explicit filters when configured', () => {
      const col: AdvancedTableColumn = {
        ...baseCol,
        filterable: true,
        filters: [{ text: '启用', value: 'active' }],
      }
      expect(resolveColumnFilters(col, [])).toEqual([{ text: '启用', value: 'active' }])
    })

    it('auto-generates from options when filterable without filters', () => {
      const col: AdvancedTableColumn = {
        ...baseCol,
        filterable: true,
        options: [
          { label: '审批中', value: 'submitted' },
          { label: '已通过', value: 'approved' },
        ],
      }
      expect(resolveColumnFilters(col, [])).toEqual([
        { text: '审批中', value: 'submitted' },
        { text: '已通过', value: 'approved' },
      ])
    })

    it('auto-generates from distinct row values when no options', () => {
      const col: AdvancedTableColumn = {
        ...baseCol,
        filterable: true,
      }
      const rows = [{ status: 'submitted' }, { status: 'approved' }]
      expect(resolveColumnFilters(col, rows)).toEqual([
        { text: 'approved', value: 'approved' },
        { text: 'submitted', value: 'submitted' },
      ])
    })

    it('returns undefined when filterable but no data to derive filters', () => {
      const col: AdvancedTableColumn = { ...baseCol, filterable: true }
      expect(resolveColumnFilters(col, [])).toBeUndefined()
    })
  })
})
