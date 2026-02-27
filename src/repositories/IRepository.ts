export interface ApiRequestOptions {
  headers?: Record<string, string>
  timeout?: number
  circuitBreaker?: boolean
}

export interface IRepository {
  get<T>(path: string, options?: ApiRequestOptions): Promise<T>
  post<T>(path: string, body?: unknown, options?: ApiRequestOptions): Promise<T>
  put<T>(path: string, body?: unknown, options?: ApiRequestOptions): Promise<T>
  delete<T>(path: string, options?: ApiRequestOptions): Promise<T>
  patch<T>(path: string, body?: unknown, options?: ApiRequestOptions): Promise<T>
}
