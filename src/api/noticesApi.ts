/** S-05 — 公告 API 聚合层 */
import { apiClient } from '@/utils/apiClient'

export interface NoticeItem {
  id: string
  title: string
  content: string
  status: string
  publishAt?: string
  createdAt: string
}

export async function fetchPublishedNotices(page = 1, pageSize = 10) {
  const res = await apiClient.get<{ items: NoticeItem[]; total: number }>('/notices', {
    params: { status: 'published', page, pageSize },
  })
  return res.data ?? { items: [], total: 0 }
}
