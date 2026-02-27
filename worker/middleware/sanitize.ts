const HTML_ENTITY_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
}

const HTML_TAG_PATTERN = /<[^>]*>/g
const DANGEROUS_PROTOCOLS = /^(javascript:|vbscript:|data:(?!image\/)|file:|about:)/i
const SCRIPT_PATTERN = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi
const EVENT_HANDLER_PATTERN = /\bon\w+\s*=/gi

export function sanitizeHtml(input: string): string {
  if (!input || typeof input !== 'string') {
    return ''
  }

  let sanitized = input

  sanitized = sanitized.replace(SCRIPT_PATTERN, '')

  sanitized = sanitized.replace(EVENT_HANDLER_PATTERN, '')

  sanitized = sanitized.replace(DANGEROUS_PROTOCOLS, match => {
    return match.startsWith('data:image') ? match : ''
  })

  return sanitized
}

export function escapeHtml(input: string): string {
  if (!input || typeof input !== 'string') {
    return ''
  }

  return input.replace(/[&<>"'`=/]/g, char => HTML_ENTITY_MAP[char] || char)
}

export function sanitizeString(
  input: string,
  options?: {
    maxLength?: number
    allowHtml?: boolean
    trim?: boolean
  }
): string {
  if (!input || typeof input !== 'string') {
    return ''
  }

  let sanitized = options?.trim !== false ? input.trim() : input

  if (options?.maxLength && sanitized.length > options.maxLength) {
    sanitized = sanitized.slice(0, options.maxLength)
  }

  if (options?.allowHtml) {
    sanitized = sanitizeHtml(sanitized)
  } else {
    sanitized = escapeHtml(sanitized)
  }

  return sanitized
}

export function stripHtmlTags(input: string): string {
  if (!input || typeof input !== 'string') {
    return ''
  }

  return input.replace(HTML_TAG_PATTERN, '')
}

export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return ''
  }

  const trimmed = url.trim()

  if (DANGEROUS_PROTOCOLS.test(trimmed)) {
    return ''
  }

  const safeProtocols = ['http://', 'https://', 'mailto:', 'tel:']
  const hasSafeProtocol = safeProtocols.some(protocol => trimmed.toLowerCase().startsWith(protocol))

  if (!hasSafeProtocol && !trimmed.startsWith('/')) {
    return ''
  }

  return trimmed
}

export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    return ''
  }

  const sanitized = email.trim().toLowerCase()

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailPattern.test(sanitized)) {
    return ''
  }

  return sanitized
}

export function sanitizeNumericString(input: string): string {
  if (!input || typeof input !== 'string') {
    return ''
  }

  return input.replace(/[^0-9.\-+]/g, '')
}

export function sanitizeAlphanumeric(input: string): string {
  if (!input || typeof input !== 'string') {
    return ''
  }

  return input.replace(/[^a-zA-Z0-9]/g, '')
}

export function sanitizeIdentifier(input: string): string {
  if (!input || typeof input !== 'string') {
    return ''
  }

  return input.replace(/[^a-zA-Z0-9_-]/g, '')
}

const SSRF_BLOCKED_HOSTS = [
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '169.254.169.254',
  'metadata.google.internal',
  'metadata.azure',
]

const SSRF_BLOCKED_PATTERNS = [
  /^10\./,
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
  /^192\.168\./,
  /^169\.254\./,
  /^\[?::1\]?$/i,
  /^\[?0:0:0:0:0:0:0:1\]?$/i,
  /^\[?fc00/i,
  /^\[?fe80/i,
]

export function isValidWebhookUrl(url: string): { valid: boolean; reason?: string } {
  if (!url || typeof url !== 'string') {
    return { valid: false, reason: 'URL is required' }
  }

  let parsedUrl: URL
  try {
    parsedUrl = new URL(url)
  } catch {
    return { valid: false, reason: 'Invalid URL format' }
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    return { valid: false, reason: 'Only HTTP and HTTPS protocols are allowed' }
  }

  const hostname = parsedUrl.hostname.toLowerCase()

  if (SSRF_BLOCKED_HOSTS.includes(hostname)) {
    return { valid: false, reason: 'Private/internal hostnames are not allowed' }
  }

  for (const pattern of SSRF_BLOCKED_PATTERNS) {
    if (pattern.test(hostname)) {
      return { valid: false, reason: 'Private/internal IP addresses are not allowed' }
    }
  }

  if (hostname.endsWith('.local') || hostname.endsWith('.internal')) {
    return { valid: false, reason: 'Private/internal hostnames are not allowed' }
  }

  return { valid: true }
}
