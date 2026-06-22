import { describe, it, expect } from 'vitest';
import { sanitizeHtml } from './sanitize';

describe('sanitizeHtml', () => {
  it('allows safe HTML tags', () => {
    const html = '<p>Hello <strong>world</strong></p>';
    expect(sanitizeHtml(html)).toBe('<p>Hello <strong>world</strong></p>');
  });

  it('strips script tags', () => {
    const html = '<p>Hello</p><script>alert(1)</script>';
    expect(sanitizeHtml(html)).toBe('<p>Hello</p>');
  });

  it('strips inline event handlers', () => {
    const html = '<p onclick="alert(1)">Click me</p>';
    expect(sanitizeHtml(html)).toBe('<p>Click me</p>');
  });

  it('strips javascript: URIs in links', () => {
    const html = '<a href="javascript:alert(1)">link</a>';
    const result = sanitizeHtml(html);
    expect(result).not.toContain('javascript:');
    expect(result).toContain('>link</a>');
  });

  it('strips iframe, object, embed tags', () => {
    const html = '<iframe src="https://evil.com"></iframe><p>safe</p>';
    expect(sanitizeHtml(html)).toBe('<p>safe</p>');
  });

  it('strips style tags', () => {
    const html = '<style>body { background: red; }</style><p>safe</p>';
    expect(sanitizeHtml(html)).toBe('<p>safe</p>');
  });

  it('allows img with safe attributes', () => {
    const html = '<img src="https://example.com/photo.jpg" alt="photo" />';
    const result = sanitizeHtml(html);
    expect(result).toContain('src="https://example.com/photo.jpg"');
    expect(result).toContain('alt="photo"');
  });

  it('strips data-* attributes', () => {
    const html = '<p data-xss="evil">safe</p>';
    expect(sanitizeHtml(html)).toBe('<p>safe</p>');
  });

  it('returns empty string for malicious input', () => {
    expect(sanitizeHtml('<script>alert(1)</script>')).toBe('');
  });

  it('preserves nested safe HTML structure', () => {
    const html = '<ul><li>Item <strong>1</strong></li><li>Item <em>2</em></li></ul>';
    const result = sanitizeHtml(html);
    expect(result).toBe(html);
  });

  it('allows links with safe href and target', () => {
    const html = '<a href="https://example.com" target="_blank" rel="noopener">Link</a>';
    expect(sanitizeHtml(html)).toBe(html);
  });
});
