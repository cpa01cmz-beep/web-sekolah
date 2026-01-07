import { describe, it, expect } from 'vitest';
import { sanitizeHtml, sanitizeString } from '../validation';

describe('Validation Utilities', () => {
  describe('sanitizeHtml', () => {
    it('should escape HTML entities', () => {
      const input = '<script>alert("XSS")</script>';
      const result = sanitizeHtml(input);

      expect(result).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;');
    });

    it('should escape ampersand', () => {
      const result = sanitizeHtml('Tom & Jerry');

      expect(result).toBe('Tom &amp; Jerry');
    });

    it('should escape less than', () => {
      const result = sanitizeHtml('A < B');

      expect(result).toBe('A &lt; B');
    });

    it('should escape greater than', () => {
      const result = sanitizeHtml('A > B');

      expect(result).toBe('A &gt; B');
    });

    it('should escape double quotes', () => {
      const result = sanitizeHtml('Hello "World"');

      expect(result).toBe('Hello &quot;World&quot;');
    });

    it('should escape single quotes', () => {
      const result = sanitizeHtml("Hello 'World'");

      expect(result).toBe('Hello &#x27;World&#x27;');
    });

    it('should escape forward slash', () => {
      const result = sanitizeHtml('A / B');

      expect(result).toBe('A &#x2F; B');
    });

    it('should handle complex HTML with multiple entities', () => {
      const input = '<div>Hello "World" & <test></div>';
      const result = sanitizeHtml(input);

      expect(result).toBe('&lt;div&gt;Hello &quot;World&quot; &amp; &lt;test&gt;&lt;&#x2F;div&gt;');
    });

    it('should handle empty string', () => {
      const result = sanitizeHtml('');

      expect(result).toBe('');
    });

    it('should escape special characters in sequence', () => {
      const input = '<&">\'/';
      const result = sanitizeHtml(input);

      expect(result).toBe('&lt;&amp;&quot;&gt;&#x27;&#x2F;');
    });
  });

  describe('sanitizeString', () => {
    it('should return trimmed string without HTML brackets', () => {
      const result = sanitizeString('  Hello <script> World  ');

      expect(result).toBe('Hello script World');
    });

    it('should throw error for non-string input', () => {
      expect(() => sanitizeString(123 as any)).toThrow('Input must be a string');
    });

    it('should throw error for null input', () => {
      expect(() => sanitizeString(null as any)).toThrow('Input must be a string');
    });

    it('should throw error for undefined input', () => {
      expect(() => sanitizeString(undefined as any)).toThrow('Input must be a string');
    });

    it('should throw error for object input', () => {
      expect(() => sanitizeString({} as any)).toThrow('Input must be a string');
    });

    it('should remove angle brackets', () => {
      const result = sanitizeString('Test<1>2<3>');

      expect(result).toBe('Test123');
    });

    it('should preserve safe characters', () => {
      const result = sanitizeString('Hello World 123!@#$%^&*()');

      expect(result).toBe('Hello World 123!@#$%^&*()');
    });

    it('should handle string with only angle brackets', () => {
      const result = sanitizeString('<<<>>>');

      expect(result).toBe('');
    });

    it('should trim whitespace from input', () => {
      const result = sanitizeString('  test string  ');

      expect(result).toBe('test string');
    });

    it('should handle mixed content with HTML and text', () => {
      const result = sanitizeString('Regular text <html> more text');

      expect(result).toBe('Regular text html more text');
    });

    it('should handle Unicode characters', () => {
      const result = sanitizeString('Hello 世界 مرحبا');

      expect(result).toBe('Hello 世界 مرحبا');
    });

    it('should handle newlines and tabs', () => {
      const result = sanitizeString('  Hello\nWorld\t  ');

      expect(result).toBe('Hello\nWorld');
    });

    it('should handle multiple consecutive angle brackets', () => {
      const result = sanitizeString('<<test>> <<another>>');

      expect(result).toBe('test another');
    });

    it('should preserve content between brackets', () => {
      const result = sanitizeString('<start>content<end>');

      expect(result).toBe('startcontentend');
    });

    it('should handle nested brackets', () => {
      const result = sanitizeString('<<nested>>content<<inner>>');

      expect(result).toBe('nestedcontentinner');
    });

    it('should not throw error for empty string', () => {
      expect(() => sanitizeString('')).not.toThrow();
    });

    it('should return empty string for only whitespace', () => {
      const result = sanitizeString('   \n\t   ');

      expect(result).toBe('');
    });
  });
});
