import { ApiResponse } from '../../shared/types'
import { ApiTimeout, RetryDelay, RetryCount, CircuitBreakerConfig } from '../config/time'
import { STORAGE_KEYS } from '../constants/storage-keys'
import { storage } from '../lib/storage'
import { CircuitBreaker, type CircuitBreakerState } from '@shared/CircuitBreaker'
import { withRetry } from './resilience/Retry'
import { fetchWithTimeout, type RequestOptions } from './api/fetch-timeout'
import {
  ApiError,
  createApiError,
  handleErrorResponse,
  handleApiSuccessError,
  handleMissingDataError,
  type ApiError as ApiErrorType,
} from './api/error-handling'
import { queryClient as queryClientInstance } from './api/query-client'
import { useQuery as useQueryHook, useMutation as useMutationHook } from './api/react-query-hooks'

const getAuthToken = () => storage.getItem(STORAGE_KEYS.AUTH_TOKEN)

const circuitBreaker = new CircuitBreaker('api-client', {
  failureThreshold: CircuitBreakerConfig.FAILURE_THRESHOLD,
  timeoutMs: CircuitBreakerConfig.TIMEOUT_MS,
})

export async function apiClient<T>(
  path: string,
  init?: RequestInit & { timeout?: number; circuitBreaker?: boolean }
): Promise<T> {
  const {
    headers: initHeaders,
    timeout = ApiTimeout.THIRTY_SECONDS,
    circuitBreaker: useCircuitBreaker = true,
    ...restInit
  } = init || {}
  const requestId = crypto.randomUUID()

  const executeRequest = async (): Promise<T> => {
    const token = getAuthToken()
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Request-ID': requestId,
      ...(initHeaders as Record<string, string>),
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const res = await fetchWithTimeout(path, {
      timeout,
      headers,
      ...restInit,
    })

    const requestIdHeader = res.headers.get('X-Request-ID')

    if (!res.ok) {
      throw await handleErrorResponse(res, requestId, requestIdHeader)
    }

    const json = (await res.json()) as ApiResponse<T>
    if (!json.success) {
      throw handleApiSuccessError(json, res.status, requestId, requestIdHeader)
    }

    if (json.data === undefined) {
      throw handleMissingDataError(res.status, requestId, requestIdHeader)
    }

    return json.data
  }

  if (useCircuitBreaker) {
    return circuitBreaker.execute(() =>
      withRetry(executeRequest, {
        maxRetries: RetryCount.THREE,
        baseDelay: RetryDelay.ONE_SECOND,
        jitterMs: RetryDelay.ONE_SECOND,
        shouldRetry: error => {
          const apiError = error as ApiErrorType
          return apiError.retryable ?? false
        },
      })
    )
  }

  return withRetry(executeRequest, {
    maxRetries: RetryCount.THREE,
    baseDelay: RetryDelay.ONE_SECOND,
    jitterMs: RetryDelay.ONE_SECOND,
    shouldRetry: error => {
      const apiError = error as ApiErrorType
      return apiError.retryable ?? false
    },
  })
}

export function getCircuitBreakerState(): CircuitBreakerState {
  return circuitBreaker.getState()
}

export function resetCircuitBreaker(): void {
  circuitBreaker.reset()
}

export const queryClient = queryClientInstance
export const useQuery = useQueryHook
export const useMutation = useMutationHook
export type { ApiError, RequestOptions }
