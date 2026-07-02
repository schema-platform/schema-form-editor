import type { ApprovalLogItem } from '@/api/flowApi'

export const flowTimelineMock = {
  kind: 'record' as const,
  staticData: {
    logs: [
      {
        id: 'log-1',
        action: 'approve',
        nodeName: '部门经理审批',
        operator: '张经理',
        comment: '同意',
        createdAt: '2026-07-02T10:00:00.000Z',
      },
      {
        id: 'log-2',
        action: 'claim',
        nodeName: 'HR 审批',
        operator: '李人事',
        createdAt: '2026-07-02T11:00:00.000Z',
      },
    ] satisfies ApprovalLogItem[],
  },
}
