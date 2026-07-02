import type { RecordWidgetMock } from '../base/widgetMock'

/** 描述列表 — 默认 mock（请假详情） */
export const descriptionsMock: RecordWidgetMock = {
  kind: 'record',
  staticData: {
    applicantName: '张三',
    leaveType: '年假',
    startTime: '2026-07-05 09:00',
    endTime: '2026-07-07 18:00',
    days: 3,
    reason: '家庭事务处理。',
    deptName: '研发部',
    status: '审批中',
  },
}
