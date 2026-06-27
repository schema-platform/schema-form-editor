/**
 * useApiRequest -- 通用 API 请求 composable
 *
 * 封装 fetch 请求，支持自定义 URL、方法、Headers。
 * 返回解析后的 JSON 数据。
 * 统一经过 apiClient，自动注入 token 和错误处理。
 */
import { apiClient } from '@/utils/apiClient'

export function useApiRequest() {
  async function fetchApi(
    url: string,
    method: string = 'get',
    headers: Record<string, string> = {},
    params?: unknown,
  ): Promise<unknown> {
    return apiClient.requestUrl(method, url, params, headers)
  }

  return { fetchApi }
}
