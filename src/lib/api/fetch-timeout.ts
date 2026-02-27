import { ApiTimeout } from '../../config/time'

export interface RequestOptions extends RequestInit {
  timeout?: number
}

export async function fetchWithTimeout(
  url: string,
  options: RequestOptions = {}
): Promise<Response> {
  const { timeout = ApiTimeout.THIRTY_SECONDS, ...restOptions } = options
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...restOptions,
      signal: controller.signal,
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === 'AbortError') {
      const timeoutError = new Error('Request timeout') as Error & {
        code?: string
        status?: number
        retryable?: boolean
      }
      timeoutError.code = 'TIMEOUT'
      timeoutError.status = 408
      timeoutError.retryable = true
      throw timeoutError
    }
    throw error
  }
}
