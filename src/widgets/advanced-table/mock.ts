import type { TableWidgetMock } from '../base/widgetMock'

/**
 * 高级表格 — 默认 mock（请假台账场景）
 * 设计器未配置 API 时在画布展示，便于排布列 tag/按钮/tooltip。
 *
 * 字段采用扁平结构以便设计器预览（运行时 API 可能为 data.xxx，见 E-03）。
 */
export const advancedTableMock: TableWidgetMock = {
  kind: 'table',
  total: 5,
  rows: [
    {
      _id: 'LV20260001',
      status: 'submitted',
      createdAt: '2026-06-28 09:15',
      applicantName: '张三',
      leaveType: 'annual',
      days: 3,
      reason: '家庭事务处理，需请假三天。',
      deptName: '研发部',
    },
    {
      _id: 'LV20260002',
      status: 'approved',
      createdAt: '2026-06-27 14:20',
      applicantName: '李四',
      leaveType: 'sick',
      days: 1,
      reason: '身体不适，申请病假一天，已附诊断证明。',
      deptName: '产品部',
    },
    {
      _id: 'LV20260003',
      status: 'rejected',
      createdAt: '2026-06-26 11:00',
      applicantName: '王五',
      leaveType: 'personal',
      days: 2,
      reason: '个人原因请假。',
      deptName: '人事部',
    },
    {
      _id: 'LV20260004',
      status: 'submitted',
      createdAt: '2026-06-25 16:45',
      applicantName: '赵六',
      leaveType: 'annual',
      days: 5,
      reason: '年假休息。',
      deptName: '财务部',
    },
    {
      _id: 'LV20260005',
      status: 'approved',
      createdAt: '2026-06-24 08:30',
      applicantName: '钱七',
      leaveType: 'marriage',
      days: 10,
      reason: '婚假。',
      deptName: '行政部',
    },
  ],
}
