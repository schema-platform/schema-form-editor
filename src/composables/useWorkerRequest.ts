/** useWorkerRequest — fetch 请求封装 */
import { ref, readonly, type Ref } from 'vue'
import { useLogger } from './useLogger'
import { apiClient } from '@/utils/apiClient'

export interface RequestConfig {
  url: string
  method?: 'get' | 'post'
  params?: Record<string, unknown>
  headers?: Record<string, string>
  dataPath?: string
}

export interface WorkerRequestAPI {
  request: (config: RequestConfig) => Promise<unknown>
  pendingCount: Readonly<Ref<number>>
}

function extractByPath(data: unknown, path: string): unknown {
  return path.split('.').reduce((obj, key) => {
    if (obj && typeof obj === 'object' && key in obj) {
      return (obj as Record<string, unknown>)[key]
    }
    return undefined
  }, data)
}

export function useWorkerRequest(): WorkerRequestAPI {
  const logger = useLogger('WorkerRequest')
  const pendingCount = ref(0)

  async function request(config: RequestConfig): Promise<unknown> {
    pendingCount.value++
    try {
      const { url, method = 'get', params, headers, dataPath } = config

      let data: unknown = await apiClient.requestUrl(
        method,
        url,
        params,
        headers,
      )
      if (dataPath) {
        const extracted = extractByPath(data, dataPath)
        if (extracted !== undefined) data = extracted
      }
      return data
    } catch (e) {
      logger.error('request failed:', e)
      throw e
    } finally {
      pendingCount.value--
    }
  }

  return { request, pendingCount: readonly(pendingCount) }
}
