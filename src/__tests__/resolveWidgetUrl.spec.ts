import { describe, it, expect } from 'vitest'
import { resolveWidgetUrl } from '@/utils/resolveWidgetUrl'

describe('resolveWidgetUrl', () => {
  it('replaces {{variables.name}} placeholders', () => {
    const url = '/business/hr/leave/detail?recordId={{variables.recordId}}'
    expect(resolveWidgetUrl(url, { recordId: 'abc-123' })).toBe(
      '/business/hr/leave/detail?recordId=abc-123',
    )
  })

  it('replaces {{name}} shorthand placeholders', () => {
    expect(resolveWidgetUrl('/items/{{id}}', { id: 'x/y' })).toBe('/items/x%2Fy')
  })

  it('leaves empty segment when variable is missing', () => {
    expect(resolveWidgetUrl('/detail?recordId={{variables.recordId}}', {})).toBe(
      '/detail?recordId=',
    )
  })

  it('returns url unchanged when no placeholders', () => {
    expect(resolveWidgetUrl('/depts', { recordId: '1' })).toBe('/depts')
  })
})
