import DOMPurify from 'isomorphic-dompurify';

/**
 * Allowed HTML tags for noticia contenido.
 *
 * Restrictive but flexible enough for rich-text articles:
 * headings, paragraphs, lists, links, images, bold/italic, code.
 */
const ALLOWED_TAGS = [
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'p', 'br', 'hr',
  'ul', 'ol', 'li',
  'a', 'img',
  'strong', 'b', 'em', 'i', 'u', 's', 'mark',
  'blockquote', 'pre', 'code', 'kbd', 'samp',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'div', 'span',
  'figure', 'figcaption',
];

const ALLOWED_ATTRS = [
  'href', 'target', 'rel',       // links
  'src', 'alt', 'width', 'height', // images
  'class',                        // styling
];

const URI_SAFE_ATTRS = ['href', 'src'];

/**
 * Sanitize HTML content for safe rendering via dangerouslySetInnerHTML.
 *
 * Strips all tags and attributes not in the allowlist.
 * Blocks javascript: URIs and other dangerous schemes.
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: ALLOWED_ATTRS,
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: URI_SAFE_ATTRS, // enforce URI safety on these
    FORBID_CONTENTS: ['style', 'script', 'noscript', 'iframe', 'object', 'embed', 'form', 'input'],
  });
}
