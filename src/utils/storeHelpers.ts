/**
 * storeHelpers — Store 通用状态管理工具
 *
 * 统一 withLoading / setError / clearError 样板代码，
 * 消除 api/tenant/schemaVersion 等 store 中的重复逻辑。
 */
import { ref, type Ref } from 'vue'
import { ApiError } from './apiClient'

export interface LoadingState {
  loading: Ref<boolean>
  error: Ref<string>
  setError: (message: string) => void
  clearError: () => void
  withLoading: <T>(fn: () => Promise<T>) => Promise<T | null>
  withErrorHandling: <T>(fn: () => Promise<T>) => Promise<T | null>
}

/**
 * 创建统一的 loading/error 状态管理。
 *
 * @example
 * ```ts
 * const { loading, error, withLoading } = createLoadingState()
 *
 * async function fetchList() {
 *   return withLoading(() => apiClient.get('/list'))
 * }
 * ```
 */
export function createLoadingState(): LoadingState {
  const loading = ref(false)
  const error = ref('')

  function setError(message: string): void {
    error.value = message
    loading.value = false
  }

  function clearError(): void {
    error.value = ''
  }

  async function withLoading<T>(fn: () => Promise<T>): Promise<T | null> {
    loading.value = true
    clearError()
    try {
      return await fn()
    } catch (e: unknown) {
      if (e instanceof ApiError) {
        setError(e.message)
      } else if (e instanceof Error) {
        setError(e.message)
      } else {
        setError('An unexpected error occurred')
      }
      return null
    } finally {
      loading.value = false
    }
  }

  async function withErrorHandling<T>(fn: () => Promise<T>): Promise<T | null> {
    clearError()
    try {
      return await fn()
    } catch (e: unknown) {
      if (e instanceof ApiError) {
        setError(e.message)
      } else if (e instanceof Error) {
        setError(e.message)
      } else {
        setError('An unexpected error occurred')
      }
      return null
    }
  }

  return { loading, error, setError, clearError, withLoading, withErrorHandling }
}
