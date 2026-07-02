/**
 * Flow API — Editor 运行时流程操作聚合层
 */
import { apiClient } from '@/utils/apiClient'

export interface ApprovalLogItem {
  id: string
  action: string
  nodeName: string
  operator: string
  comment?: string
  createdAt: string
}

export interface FlowTaskData {
  id: string
  instanceId: string
  nodeId: string
  nodeName: string
  status: string
  formData?: Record<string, unknown>
}

export async function fetchApprovalLogs(instanceId: string): Promise<ApprovalLogItem[]> {
  const params = new URLSearchParams({ instanceId })
  const resp = await apiClient.get<{ items?: ApprovalLogItem[] } | ApprovalLogItem[]>(
    `/flow-approvals?${params}`,
  )
  if (Array.isArray(resp)) return resp
  return resp?.items ?? []
}

export async function fetchFlowTask(taskId: string): Promise<FlowTaskData> {
  return apiClient.get<FlowTaskData>(`/flow-tasks/${taskId}`)
}

export async function fetchMyPendingTaskForInstance(instanceId: string): Promise<FlowTaskData | null> {
  const params = new URLSearchParams({ status: 'pending', pageSize: '50' })
  const resp = await apiClient.get<{ items?: FlowTaskData[] }>(`/flow-tasks/my?${params}`)
  const items = resp?.items ?? []
  const match = items.find((t) => t.instanceId === instanceId)
  if (match) return match
  const claimed = await apiClient.get<{ items?: FlowTaskData[] }>(
    `/flow-tasks/my?${new URLSearchParams({ status: 'claimed', pageSize: '50' })}`,
  )
  return (claimed?.items ?? []).find((t) => t.instanceId === instanceId) ?? null
}

export async function claimFlowTask(taskId: string): Promise<void> {
  await apiClient.post(`/flow-tasks/${taskId}/claim`, {})
}

export async function completeFlowTask(
  taskId: string,
  data: { outcome: 'approve' | 'reject'; comment?: string; formData?: Record<string, unknown> },
): Promise<void> {
  await apiClient.post(`/flow-tasks/${taskId}/complete`, data)
}

export async function rejectFlowTaskToNode(
  taskId: string,
  data: { targetNodeId: string; comment?: string },
): Promise<void> {
  await apiClient.post(`/flow-tasks/${taskId}/reject-to-node`, data)
}

export async function delegateFlowTask(
  taskId: string,
  data: { targetUserId: string; comment?: string },
): Promise<void> {
  await apiClient.post(`/flow-tasks/${taskId}/delegate`, data)
}

export async function fetchRejectTargets(taskId: string): Promise<Array<{ nodeId: string; nodeName: string }>> {
  return apiClient.get<Array<{ nodeId: string; nodeName: string }>>(`/flow-tasks/${taskId}/reject-targets`)
}

export interface ApprovalSuggestion {
  suggestion: string
  confidence: number
  reasoning: string
  recommendedAction?: 'approve' | 'reject' | 'review'
}

export async function fetchApprovalSuggestion(payload: {
  taskId?: string
  submissionId?: string
  formData?: Record<string, unknown>
}): Promise<ApprovalSuggestion> {
  return apiClient.post<ApprovalSuggestion>('/ai/runtime/approval-suggestion', payload)
}
