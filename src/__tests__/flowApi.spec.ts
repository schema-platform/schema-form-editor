import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  fetchApprovalLogs,
  fetchMyPendingTaskForInstance,
  fetchApprovalSuggestion,
} from '@/api/flowApi'

vi.mock('@/utils/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

import { apiClient } from '@/utils/apiClient'

describe('flowApi', () => {
  beforeEach(() => {
    vi.mocked(apiClient.get).mockReset()
    vi.mocked(apiClient.post).mockReset()
  })

  it('fetchApprovalLogs returns items array', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      items: [{ id: '1', action: 'approve', nodeName: '审批', operator: 'admin', createdAt: '2026-01-01' }],
    })
    const logs = await fetchApprovalLogs('inst-1')
    expect(logs).toHaveLength(1)
    expect(logs[0].action).toBe('approve')
  })

  it('fetchMyPendingTaskForInstance finds matching task', async () => {
    vi.mocked(apiClient.get)
      .mockResolvedValueOnce({ items: [{ id: 't1', instanceId: 'inst-1', nodeName: '审批', status: 'pending' }] })
      .mockResolvedValueOnce({ items: [] })
    const task = await fetchMyPendingTaskForInstance('inst-1')
    expect(task?.id).toBe('t1')
  })

  it('fetchApprovalSuggestion posts to runtime API', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      suggestion: '建议通过',
      confidence: 0.8,
      reasoning: '规则判断',
    })
    const result = await fetchApprovalSuggestion({ taskId: 't1' })
    expect(result.suggestion).toBe('建议通过')
  })
})
