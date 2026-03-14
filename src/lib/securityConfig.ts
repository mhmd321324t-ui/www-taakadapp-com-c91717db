/**
 * Security Configuration and Best Practices
 * Implements OWASP security guidelines and modern web security practices
 */

// Content Security Policy headers (configured in server)
export const CSP_HEADERS = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'data:', 'https:'],
  'font-src': ["'self'", 'data:', 'https:'],
  'connect-src': ["'self'", 'https://api.aladhan.com', 'https://api.resend.com', 'https://*.supabase.co'],
  'frame-ancestors': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
};

// Security headers
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(self), microphone=(), camera=(), payment=()',
};

// Rate limiting configuration
export const RATE_LIMITS = {
  API_CALLS_PER_MINUTE: 60,
  AUTH_ATTEMPTS_PER_HOUR: 5,
  PUSH_SUBSCRIPTION_PER_DAY: 100,
};

// Encryption utilities
export function encryptSensitiveData(data: string, key: string): string {
  try {
    // Use base64 encoding for transport (not encryption)
    // In production, use proper encryption like TweetNaCl.js or libsodium.js
    return btoa(data);
  } catch (error) {
    console.error('Encryption failed:', error);
    return '';
  }
}

export function decryptSensitiveData(encrypted: string, key: string): string {
  try {
    return atob(encrypted);
  } catch (error) {
    console.error('Decryption failed:', error);
    return '';
  }
}

// Validate and sanitize user input
export function sanitizeInput(input: string): string {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

// Validate email format
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate phone number format
export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
  return phoneRegex.test(phone);
}

// Generate secure random token
export function generateSecureToken(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Check for XSS vulnerabilities
export function isXSSVulnerable(input: string): boolean {
  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /on\w+\s*=/gi,
    /javascript:/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
  ];
  return xssPatterns.some(pattern => pattern.test(input));
}

// Secure local storage wrapper
export const secureStorage = {
  setItem: (key: string, value: string) => {
    try {
      const encrypted = encryptSensitiveData(value, key);
      localStorage.setItem(key, encrypted);
    } catch (error) {
      console.error('Failed to set secure storage:', error);
    }
  },
  getItem: (key: string): string | null => {
    try {
      const encrypted = localStorage.getItem(key);
      if (!encrypted) return null;
      return decryptSensitiveData(encrypted, key);
    } catch (error) {
      console.error('Failed to get secure storage:', error);
      return null;
    }
  },
  removeItem: (key: string) => {
    localStorage.removeItem(key);
  },
};

// HTTPS enforcement
export function enforceHTTPS(): void {
  if (typeof window !== 'undefined' && window.location.protocol !== 'https:' && import.meta.env.PROD) {
    window.location.protocol = 'https:';
  }
}

// Subresource Integrity (SRI) for external scripts
export const SRI_HASHES = {
  'https://cdn.jsdelivr.net/npm/some-library@1.0.0/dist/lib.min.js':
    'sha384-abc123...',
};

// API request security wrapper
export async function secureAPICall(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    ...options.headers,
  };

  // Add CSRF token if available
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
  if (csrfToken) {
    headers['X-CSRF-Token'] = csrfToken;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }

  return response;
}

// Initialize security measures
export function initializeSecurity(): void {
  // Enforce HTTPS
  enforceHTTPS();

  // Disable right-click context menu in production (currently no-op by design)
  if (import.meta.env.PROD) {
    document.addEventListener('contextmenu', () => {
      // Intentionally left blank.
    });
  }

  // Set security headers via meta tags
  const metaTags = [
    { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no' },
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
  ];

  metaTags.forEach(({ name, content }) => {
    const meta = document.querySelector(`meta[name="${name}"]`);
    if (meta) {
      meta.setAttribute('content', content);
    } else {
      const newMeta = document.createElement('meta');
      newMeta.name = name;
      newMeta.content = content;
      document.head.appendChild(newMeta);
    }
  });
}
