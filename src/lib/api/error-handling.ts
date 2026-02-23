import { mapStatusToErrorCode } from '../../../shared/error-utils'
import { HttpStatusCode } from '@shared/constants'

export interface ApiError extends Error {
  status?: number
  code?: string
  retryable?: boolean
  requestId?: string
}

export function createApiError(
  message: string,
  status: number,
  code?: string,
  requestId?: string
): ApiError {
  const error = new Error(message) as ApiError
  error.status = status
  error.code = code || mapStatusToErrorCode(status)
  error.requestId = requestId
  error.retryable = isRetryableStatus(status)
  return error
}

export function isRetryableStatus(status: number): boolean {
  if (status === HttpStatusCode.TOO_MANY_REQUESTS) return true
  if (status >= 500 && status < 600) return true
  if (status === HttpStatusCode.REQUEST_TIMEOUT) return true
  return false
}

export function shouldRetryError(error: ApiError): boolean {
  if (!error.retryable) return false
  if (error.status === HttpStatusCode.NOT_FOUND) return false
  if (error.code === 'VALIDATION_ERROR') return false
  if (error.code === 'UNAUTHORIZED') return false
  if (error.code === 'FORBIDDEN') return false
  return true
}

export async function parseErrorResponse(response: Response): Promise<Record<string, unknown>> {
  return response.json().catch(() => ({}))
}

export async function handleErrorResponse(
  response: Response,
  requestId: string,
  requestIdHeader: string | null
): Promise<ApiError> {
  const errorJson = await parseErrorResponse(response)
  return createApiError(
    (errorJson.error as string) || `Request failed with status ${response.status}`,
    response.status,
    errorJson.code as string,
    requestIdHeader || requestId
  )
}

export function handleApiSuccessError(
  json: { success: boolean; error?: string; code?: string },
  status: number,
  requestId: string,
  requestIdHeader: string | null
): ApiError {
  return createApiError(
    json.error || 'API request failed',
    status,
    json.code,
    requestIdHeader || requestId
  )
}

export function handleMissingDataError(
  status: number,
  requestId: string,
  requestIdHeader: string | null
): ApiError {
  return createApiError(
    'API response missing data field',
    status,
    'INTERNAL_SERVER_ERROR',
    requestIdHeader || requestId
  )
}
