export interface ClientErrorReport {
  message: string
  url: string
  userAgent: string
  timestamp: string
  stack?: string
  componentStack?: string
  errorBoundary?: boolean
  errorBoundaryProps?: Record<string, unknown>
  source?: string
  lineno?: number
  colno?: number
  error?: unknown
}

export interface CSPViolationReport {
  'csp-report': {
    'document-uri'?: string
    referrer?: string
    'violated-directive'?: string
    'effective-directive'?: string
    'original-policy'?: string
    disposition?: string
    'blocked-uri'?: string
    'line-number'?: number
    'column-number'?: number
    'source-file'?: string
    'status-code'?: string
    'script-sample'?: string
  }
}
