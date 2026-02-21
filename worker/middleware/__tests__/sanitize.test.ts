import { describe, it, expect } from 'vitest';
import {
  sanitizeHtml,
  escapeHtml,
  sanitizeString,
  stripHtmlTags,
  sanitizeUrl,
  sanitizeEmail,
  sanitizeNumericString,
  sanitizeAlphanumeric,
  sanitizeIdentifier,
} from '../sanitize';

describe('sanitizeHtml', () => {
  it('should remove script tags', () => {
    const input = '<script>alert("xss")</script>Hello';
    expect(sanitizeHtml(input)).toBe('Hello');
  });

  it('should remove multiple script tags', () => {
    const input = '<script>alert(1)</script>text<script>alert(2)</script>';
    expect(sanitizeHtml(input)).toBe('text');
  });

  it('should remove event handlers', () => {
    const input = '<div onclick="alert(1)">Click me</div>';
    const result = sanitizeHtml(input);
    expect(result).not.toContain('onclick');
    expect(result).toContain('Click me');
  });

  it('should handle javascript: protocol in HTML context', () => {
    const input = '<a href="javascript:alert(1)">Link</a>';
    const result = sanitizeHtml(input);
    expect(result).toContain('Link');
  });

  it('should allow data:image URLs', () => {
    const input = '<img src="data:image/png;base64,abc">';
    expect(sanitizeHtml(input)).toBe('<img src="data:image/png;base64,abc">');
  });

  it('should handle empty string', () => {
    expect(sanitizeHtml('')).toBe('');
  });

  it('should handle null/undefined', () => {
    expect(sanitizeHtml(null as unknown as string)).toBe('');
    expect(sanitizeHtml(undefined as unknown as string)).toBe('');
  });

  it('should preserve safe HTML', () => {
    const input = '<p>Hello <strong>World</strong></p>';
    expect(sanitizeHtml(input)).toBe('<p>Hello <strong>World</strong></p>');
  });
});

describe('escapeHtml', () => {
  it('should escape HTML special characters', () => {
    expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
  });

  it('should escape ampersand', () => {
    expect(escapeHtml('a & b')).toBe('a &amp; b');
  });

  it('should escape quotes', () => {
    expect(escapeHtml('"test"')).toBe('&quot;test&quot;');
    expect(escapeHtml("'test'")).toBe('&#x27;test&#x27;');
  });

  it('should escape forward slash', () => {
    expect(escapeHtml('</div>')).toBe('&lt;&#x2F;div&gt;');
  });

  it('should handle empty string', () => {
    expect(escapeHtml('')).toBe('');
  });

  it('should handle null/undefined', () => {
    expect(escapeHtml(null as unknown as string)).toBe('');
    expect(escapeHtml(undefined as unknown as string)).toBe('');
  });

  it('should preserve normal text', () => {
    expect(escapeHtml('Hello World')).toBe('Hello World');
  });
});

describe('sanitizeString', () => {
  it('should trim whitespace by default', () => {
    expect(sanitizeString('  hello  ')).toBe('hello');
  });

  it('should not trim when trim is false', () => {
    expect(sanitizeString('  hello  ', { trim: false })).toBe('  hello  ');
  });

  it('should truncate to max length', () => {
    expect(sanitizeString('hello world', { maxLength: 5 })).toBe('hello');
  });

  it('should escape HTML by default', () => {
    expect(sanitizeString('<script>')).toBe('&lt;script&gt;');
  });

  it('should sanitize HTML when allowHtml is true', () => {
    expect(sanitizeString('<script>alert(1)</script>', { allowHtml: true })).toBe('');
  });

  it('should handle empty string', () => {
    expect(sanitizeString('')).toBe('');
  });

  it('should handle null/undefined', () => {
    expect(sanitizeString(null as unknown as string)).toBe('');
    expect(sanitizeString(undefined as unknown as string)).toBe('');
  });
});

describe('stripHtmlTags', () => {
  it('should strip all HTML tags', () => {
    expect(stripHtmlTags('<p>Hello <strong>World</strong></p>')).toBe('Hello World');
  });

  it('should handle nested tags', () => {
    expect(stripHtmlTags('<div><span>nested</span></div>')).toBe('nested');
  });

  it('should handle self-closing tags', () => {
    expect(stripHtmlTags('Hello<br/>World')).toBe('HelloWorld');
  });

  it('should handle empty string', () => {
    expect(stripHtmlTags('')).toBe('');
  });

  it('should handle null/undefined', () => {
    expect(stripHtmlTags(null as unknown as string)).toBe('');
    expect(stripHtmlTags(undefined as unknown as string)).toBe('');
  });
});

describe('sanitizeUrl', () => {
  it('should allow http URLs', () => {
    expect(sanitizeUrl('http://example.com')).toBe('http://example.com');
  });

  it('should allow https URLs', () => {
    expect(sanitizeUrl('https://example.com')).toBe('https://example.com');
  });

  it('should allow relative URLs', () => {
    expect(sanitizeUrl('/path/to/page')).toBe('/path/to/page');
  });

  it('should allow mailto URLs', () => {
    expect(sanitizeUrl('mailto:test@example.com')).toBe('mailto:test@example.com');
  });

  it('should allow tel URLs', () => {
    expect(sanitizeUrl('tel:+1234567890')).toBe('tel:+1234567890');
  });

  it('should block javascript: URLs', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBe('');
  });

  it('should block vbscript: URLs', () => {
    expect(sanitizeUrl('vbscript:msgbox(1)')).toBe('');
  });

  it('should block data: URLs (except images)', () => {
    expect(sanitizeUrl('data:text/html,<script>')).toBe('');
  });

  it('should block file: URLs', () => {
    expect(sanitizeUrl('file:///etc/passwd')).toBe('');
  });

  it('should block URLs without protocol', () => {
    expect(sanitizeUrl('example.com')).toBe('');
  });

  it('should handle empty string', () => {
    expect(sanitizeUrl('')).toBe('');
  });

  it('should handle null/undefined', () => {
    expect(sanitizeUrl(null as unknown as string)).toBe('');
    expect(sanitizeUrl(undefined as unknown as string)).toBe('');
  });

  it('should trim whitespace', () => {
    expect(sanitizeUrl('  https://example.com  ')).toBe('https://example.com');
  });
});

describe('sanitizeEmail', () => {
  it('should normalize email to lowercase', () => {
    expect(sanitizeEmail('Test@Example.COM')).toBe('test@example.com');
  });

  it('should trim whitespace', () => {
    expect(sanitizeEmail('  test@example.com  ')).toBe('test@example.com');
  });

  it('should return valid email unchanged', () => {
    expect(sanitizeEmail('user@example.com')).toBe('user@example.com');
  });

  it('should reject invalid email format', () => {
    expect(sanitizeEmail('not-an-email')).toBe('');
    expect(sanitizeEmail('missing@domain')).toBe('');
    expect(sanitizeEmail('@nodomain.com')).toBe('');
  });

  it('should handle empty string', () => {
    expect(sanitizeEmail('')).toBe('');
  });

  it('should handle null/undefined', () => {
    expect(sanitizeEmail(null as unknown as string)).toBe('');
    expect(sanitizeEmail(undefined as unknown as string)).toBe('');
  });
});

describe('sanitizeNumericString', () => {
  it('should keep only numeric characters', () => {
    expect(sanitizeNumericString('abc123def')).toBe('123');
  });

  it('should keep decimal points', () => {
    expect(sanitizeNumericString('12.34')).toBe('12.34');
  });

  it('should keep negative sign', () => {
    expect(sanitizeNumericString('-123')).toBe('-123');
  });

  it('should keep positive sign', () => {
    expect(sanitizeNumericString('+123')).toBe('+123');
  });

  it('should handle empty string', () => {
    expect(sanitizeNumericString('')).toBe('');
  });

  it('should handle null/undefined', () => {
    expect(sanitizeNumericString(null as unknown as string)).toBe('');
    expect(sanitizeNumericString(undefined as unknown as string)).toBe('');
  });
});

describe('sanitizeAlphanumeric', () => {
  it('should keep only letters and numbers', () => {
    expect(sanitizeAlphanumeric('abc123!@#')).toBe('abc123');
  });

  it('should remove spaces', () => {
    expect(sanitizeAlphanumeric('hello world')).toBe('helloworld');
  });

  it('should preserve case', () => {
    expect(sanitizeAlphanumeric('HelloWorld123')).toBe('HelloWorld123');
  });

  it('should handle empty string', () => {
    expect(sanitizeAlphanumeric('')).toBe('');
  });

  it('should handle null/undefined', () => {
    expect(sanitizeAlphanumeric(null as unknown as string)).toBe('');
    expect(sanitizeAlphanumeric(undefined as unknown as string)).toBe('');
  });
});

describe('sanitizeIdentifier', () => {
  it('should keep only alphanumeric, underscore, and hyphen', () => {
    expect(sanitizeIdentifier('hello-world_123!@#')).toBe('hello-world_123');
  });

  it('should remove spaces', () => {
    expect(sanitizeIdentifier('hello world')).toBe('helloworld');
  });

  it('should handle empty string', () => {
    expect(sanitizeIdentifier('')).toBe('');
  });

  it('should handle null/undefined', () => {
    expect(sanitizeIdentifier(null as unknown as string)).toBe('');
    expect(sanitizeIdentifier(undefined as unknown as string)).toBe('');
  });
});
