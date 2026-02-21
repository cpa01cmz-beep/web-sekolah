const HTML_ENTITY_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
};

const HTML_TAG_PATTERN = /<[^>]*>/g;
const DANGEROUS_PROTOCOLS = /^(javascript:|vbscript:|data:(?!image\/)|file:|about:)/i;
const SCRIPT_PATTERN = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
const EVENT_HANDLER_PATTERN = /\bon\w+\s*=/gi;

export function sanitizeHtml(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  let sanitized = input;
  
  sanitized = sanitized.replace(SCRIPT_PATTERN, '');
  
  sanitized = sanitized.replace(EVENT_HANDLER_PATTERN, '');
  
  sanitized = sanitized.replace(DANGEROUS_PROTOCOLS, (match) => {
    return match.startsWith('data:image') ? match : '';
  });
  
  return sanitized;
}

export function escapeHtml(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input.replace(/[&<>"'`=/]/g, (char) => HTML_ENTITY_MAP[char] || char);
}

export function sanitizeString(input: string, options?: {
  maxLength?: number;
  allowHtml?: boolean;
  trim?: boolean;
}): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  let sanitized = options?.trim !== false ? input.trim() : input;
  
  if (options?.maxLength && sanitized.length > options.maxLength) {
    sanitized = sanitized.slice(0, options.maxLength);
  }
  
  if (options?.allowHtml) {
    sanitized = sanitizeHtml(sanitized);
  } else {
    sanitized = escapeHtml(sanitized);
  }
  
  return sanitized;
}

export function stripHtmlTags(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input.replace(HTML_TAG_PATTERN, '');
}

export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return '';
  }

  const trimmed = url.trim();
  
  if (DANGEROUS_PROTOCOLS.test(trimmed)) {
    return '';
  }
  
  const safeProtocols = ['http://', 'https://', 'mailto:', 'tel:'];
  const hasSafeProtocol = safeProtocols.some(protocol => 
    trimmed.toLowerCase().startsWith(protocol)
  );
  
  if (!hasSafeProtocol && !trimmed.startsWith('/')) {
    return '';
  }
  
  return trimmed;
}

export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    return '';
  }

  const sanitized = email.trim().toLowerCase();
  
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(sanitized)) {
    return '';
  }
  
  return sanitized;
}

export function sanitizeNumericString(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input.replace(/[^0-9.\-+]/g, '');
}

export function sanitizeAlphanumeric(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input.replace(/[^a-zA-Z0-9]/g, '');
}

export function sanitizeIdentifier(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input.replace(/[^a-zA-Z0-9_-]/g, '');
}
