import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param dirty - The potentially unsafe HTML string
 * @returns Sanitized HTML string safe for rendering
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'hr',
      'ul', 'ol', 'li',
      'strong', 'em', 'u', 'b', 'i',
      'a', 'span', 'div',
      'blockquote', 'code', 'pre'
    ],
    ALLOWED_ATTR: [
      'href', 'title', 'target', 'rel',
      'class', 'id', 'style'
    ],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    ALLOW_DATA_ATTR: false
  });
}

/**
 * Sanitizes SVG content to prevent XSS while preserving styling
 * @param svg - The SVG string to sanitize
 * @returns Sanitized SVG string
 */
export function sanitizeSvg(svg: string): string {
  return DOMPurify.sanitize(svg, {
    USE_PROFILES: { svg: true, svgFilters: true },
    ALLOWED_TAGS: [
      'svg', 'g', 'path', 'circle', 'rect', 'ellipse', 'line', 'polygon', 'polyline',
      'text', 'tspan', 'title', 'desc', 'defs', 'clipPath', 'mask', 'pattern',
      'linearGradient', 'radialGradient', 'stop', 'filter', 'feColorMatrix',
      'feGaussianBlur', 'feOffset', 'feMorphology', 'feFlood', 'feComposite'
    ],
    ALLOWED_ATTR: [
      'viewBox', 'width', 'height', 'x', 'y', 'cx', 'cy', 'r', 'rx', 'ry',
      'd', 'fill', 'stroke', 'stroke-width', 'stroke-dasharray', 'stroke-linecap',
      'opacity', 'transform', 'id', 'class', 'style', 'xmlns', 'xmlns:xlink',
      'x1', 'y1', 'x2', 'y2', 'points', 'gradientUnits', 'offset', 'stop-color',
      'stop-opacity', 'clip-path', 'mask', 'filter', 'in', 'in2', 'result',
      'type', 'values', 'stdDeviation', 'dx', 'dy', 'operator', 'k1', 'k2', 'k3', 'k4',
      'flood-color', 'flood-opacity', 'cursor'
    ],
    ALLOW_DATA_ATTR: false
  });
}

/**
 * Validates and sanitizes user input
 * @param input - The user input to validate
 * @param maxLength - Maximum allowed length
 * @returns Sanitized and validated input
 */
export function validateInput(input: string, maxLength: number = 1000): string {
  if (typeof input !== 'string') {
    throw new Error('Invalid input type');
  }
  
  if (input.length > maxLength) {
    throw new Error(`Input too long. Maximum ${maxLength} characters allowed.`);
  }
  
  // Remove potentially dangerous characters
  return input.replace(/[<>\"'&]/g, (char) => {
    const entities: Record<string, string> = {
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '&': '&amp;'
    };
    return entities[char] || char;
  });
}

/**
 * Validates email format
 * @param email - Email to validate
 * @returns True if email is valid
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates UUID format
 * @param uuid - UUID to validate
 * @returns True if UUID is valid
 */
export function validateUuid(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}