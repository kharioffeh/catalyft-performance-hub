/**
 * Content Security Policy configuration
 * This helps prevent XSS attacks and other code injection vulnerabilities
 */

export const CSP_DIRECTIVES = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'", // Required for Vite in development
    "'unsafe-eval'", // Required for Vite in development
    "https://api.openai.com",
    "https://xeugyryfvilanoiethum.supabase.co"
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Required for CSS-in-JS and inline styles
    "https://fonts.googleapis.com"
  ],
  'img-src': [
    "'self'",
    "data:",
    "https:"
  ],
  'font-src': [
    "'self'",
    "data:",
    "https://fonts.gstatic.com"
  ],
  'connect-src': [
    "'self'",
    "https://api.openai.com",
    "https://xeugyryfvilanoiethum.supabase.co",
    "wss://xeugyryfvilanoiethum.supabase.co"
  ],
  'frame-ancestors': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"]
}

export function generateCSPHeader(): string {
  return Object.entries(CSP_DIRECTIVES)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ')
}

/**
 * Apply CSP meta tag to document head
 * Use this in production builds
 */
export function applyCSPMetaTag(): void {
  if (typeof document !== 'undefined') {
    const meta = document.createElement('meta')
    meta.httpEquiv = 'Content-Security-Policy'
    meta.content = generateCSPHeader()
    document.head.appendChild(meta)
  }
}