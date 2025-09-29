// lib/security/validation.ts

import { z } from 'zod';

// Common validation schemas
export const commonSchemas = {
  // Email validation
  email: z.string().email('Invalid email format').max(255, 'Email too long'),
  
  // Password validation
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  
  // Name validation
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name too long')
    .regex(/^[a-zA-Z\s\-'\.]+$/, 'Name contains invalid characters'),
  
  // Phone number validation
  phone: z
    .string()
    .regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format')
    .min(10, 'Phone number too short')
    .max(20, 'Phone number too long'),
  
  // URL validation
  url: z
    .string()
    .url('Invalid URL format')
    .max(2048, 'URL too long'),
  
  // UUID validation
  uuid: z
    .string()
    .uuid('Invalid UUID format'),
  
  // Date validation
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  
  // DateTime validation
  dateTime: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/, 'Invalid datetime format'),
  
  // Positive integer validation
  positiveInt: z
    .number()
    .int('Must be an integer')
    .positive('Must be positive'),
  
  // Non-negative integer validation
  nonNegativeInt: z
    .number()
    .int('Must be an integer')
    .min(0, 'Must be non-negative'),
  
  // String with length constraints
  stringLength: (min: number, max: number) =>
    z
      .string()
      .min(min, `Must be at least ${min} characters`)
      .max(max, `Must be at most ${max} characters`),
  
  // Alphanumeric string
  alphanumeric: z
    .string()
    .regex(/^[a-zA-Z0-9]+$/, 'Must contain only alphanumeric characters'),
  
  // Slug validation
  slug: z
    .string()
    .regex(/^[a-z0-9\-]+$/, 'Invalid slug format (lowercase letters, numbers, and hyphens only)')
    .min(1, 'Slug is required')
    .max(100, 'Slug too long'),
};

// Sanitization functions
export const sanitizers = {
  // Remove HTML tags
  stripHtml: (input: string): string => {
    return input.replace(/<[^>]*>/g, '');
  },
  
  // Escape HTML entities
  escapeHtml: (input: string): string => {
    const htmlEntities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;',
    };
    
    return input.replace(/[&<>"'/]/g, (char) => htmlEntities[char]);
  },
  
  // Normalize whitespace
  normalizeWhitespace: (input: string): string => {
    return input.replace(/\s+/g, ' ').trim();
  },
  
  // Remove control characters
  removeControlChars: (input: string): string => {
    return input.replace(/[\x00-\x1F\x7F]/g, '');
  },
  
  // Truncate string
  truncate: (input: string, maxLength: number): string => {
    if (input.length <= maxLength) return input;
    return input.substring(0, maxLength - 3) + '...';
  },
  
  // Convert to lowercase
  toLowerCase: (input: string): string => {
    return input.toLowerCase();
  },
  
  // Convert to uppercase
  toUpperCase: (input: string): string => {
    return input.toUpperCase();
  },
  
  // Remove special characters
  removeSpecialChars: (input: string): string => {
    return input.replace(/[^a-zA-Z0-9\s]/g, '');
  },
  
  // Normalize email
  normalizeEmail: (input: string): string => {
    return input.toLowerCase().trim();
  },
  
  // Normalize phone number
  normalizePhone: (input: string): string => {
    return input.replace(/[^\d]/g, '');
  },
};

// Validation middleware
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  input: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const data = schema.parse(input);
    return { success: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`),
      };
    }
    return {
      success: false,
      errors: ['Validation failed'],
    };
  }
}

// Sanitization middleware
export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    return sanitizers
      .stripHtml(input)
      .replace(/[<>]/g, '')
      .trim();
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  
  if (input && typeof input === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return input;
}

// Security validation functions
export const securityValidators = {
  // Check for SQL injection patterns
  hasSqlInjection: (input: string): boolean => {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
      /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
      /(\b(OR|AND)\s+'.*'\s*=\s*'.*')/i,
      /(\b(OR|AND)\s+".*"\s*=\s*".*")/i,
      /(UNION\s+SELECT)/i,
      /(DROP\s+TABLE)/i,
      /(DELETE\s+FROM)/i,
      /(INSERT\s+INTO)/i,
      /(UPDATE\s+SET)/i,
      /(ALTER\s+TABLE)/i,
      /(CREATE\s+TABLE)/i,
      /(EXEC\s*\()/i,
      /(SCRIPT\s*\()/i,
    ];
    
    return sqlPatterns.some(pattern => pattern.test(input));
  },
  
  // Check for XSS patterns
  hasXss: (input: string): boolean => {
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /<iframe[^>]*>.*?<\/iframe>/gi,
      /<object[^>]*>.*?<\/object>/gi,
      /<embed[^>]*>.*?<\/embed>/gi,
      /<applet[^>]*>.*?<\/applet>/gi,
      /<meta[^>]*>.*?<\/meta>/gi,
      /<link[^>]*>.*?<\/link>/gi,
      /<style[^>]*>.*?<\/style>/gi,
      /javascript:/gi,
      /vbscript:/gi,
      /onload\s*=/gi,
      /onerror\s*=/gi,
      /onclick\s*=/gi,
      /onmouseover\s*=/gi,
      /onfocus\s*=/gi,
      /onblur\s*=/gi,
      /onchange\s*=/gi,
      /onsubmit\s*=/gi,
      /onreset\s*=/gi,
      /onselect\s*=/gi,
      /onkeydown\s*=/gi,
      /onkeyup\s*=/gi,
      /onkeypress\s*=/gi,
      /onmousedown\s*=/gi,
      /onmouseup\s*=/gi,
      /onmousemove\s*=/gi,
      /onmouseout\s*=/gi,
      /onmouseenter\s*=/gi,
      /onmouseleave\s*=/gi,
      /oncontextmenu\s*=/gi,
      /ondblclick\s*=/gi,
      /onabort\s*=/gi,
      /oncanplay\s*=/gi,
      /oncanplaythrough\s*=/gi,
      /ondurationchange\s*=/gi,
      /onemptied\s*=/gi,
      /onended\s*=/gi,
      /onerror\s*=/gi,
      /onloadeddata\s*=/gi,
      /onloadedmetadata\s*=/gi,
      /onloadstart\s*=/gi,
      /onpause\s*=/gi,
      /onplay\s*=/gi,
      /onplaying\s*=/gi,
      /onprogress\s*=/gi,
      /onratechange\s*=/gi,
      /onseeked\s*=/gi,
      /onseeking\s*=/gi,
      /onstalled\s*=/gi,
      /onsuspend\s*=/gi,
      /ontimeupdate\s*=/gi,
      /onvolumechange\s*=/gi,
      /onwaiting\s*=/gi,
    ];
    
    return xssPatterns.some(pattern => pattern.test(input));
  },
  
  // Check for path traversal patterns
  hasPathTraversal: (input: string): boolean => {
    const pathTraversalPatterns = [
      /\.\.\//g,
      /\.\.\\/g,
      /\.\.%2f/gi,
      /\.\.%5c/gi,
      /\.\.%252f/gi,
      /\.\.%255c/gi,
      /\.\.%c0%af/gi,
      /\.\.%c1%9c/gi,
      /\.\.%c0%2f/gi,
      /\.\.%c1%af/gi,
    ];
    
    return pathTraversalPatterns.some(pattern => pattern.test(input));
  },
  
  // Check for command injection patterns
  hasCommandInjection: (input: string): boolean => {
    const commandPatterns = [
      /[;&|`$]/,
      /(\b(rm|del|format|fdisk|mkfs|dd|shutdown|reboot|halt|poweroff)\b)/i,
      /(\b(cat|type|more|less|head|tail|grep|find|locate|which|whereis)\b)/i,
      /(\b(ps|top|htop|kill|killall|pkill)\b)/i,
      /(\b(netstat|ss|lsof|netcat|nc|telnet|ssh|ftp|wget|curl)\b)/i,
      /(\b(ping|traceroute|nslookup|dig|host)\b)/i,
      /(\b(ls|dir|pwd|cd|mkdir|rmdir|cp|mv|chmod|chown|chgrp)\b)/i,
      /(\b(echo|printf|print|puts|write|read|gets|scanf)\b)/i,
      /(\b(exec|system|popen|shell_exec|passthru|eval)\b)/i,
      /(\b(perl|python|ruby|php|bash|sh|zsh|fish|powershell|cmd)\b)/i,
    ];
    
    return commandPatterns.some(pattern => pattern.test(input));
  },
  
  // Check for LDAP injection patterns
  hasLdapInjection: (input: string): boolean => {
    const ldapPatterns = [
      /[()=*!&|]/,
      /(\b(OU|CN|DC|UID|DN|SN|GIVENNAME|MAIL|TELEPHONE|MOBILE|POSTALCODE|STREET|CITY|STATE|COUNTRY)\b)/i,
      /(\b(AND|OR|NOT)\b)/i,
      /(\b(EQUALITY|SUBSTRING|PRESENCE|APPROXIMATE|GREATER|LESS)\b)/i,
    ];
    
    return ldapPatterns.some(pattern => pattern.test(input));
  },
  
  // Check for NoSQL injection patterns
  hasNoSqlInjection: (input: string): boolean => {
    const nosqlPatterns = [
      /(\$where|\$ne|\$gt|\$lt|\$gte|\$lte|\$in|\$nin|\$exists|\$regex|\$or|\$and|\$not|\$nor|\$all|\$elemMatch|\$size|\$type|\$mod|\$text|\$search|\$language|\$caseSensitive|\$diacriticSensitive)/i,
      /(\b(OR|AND|NOT)\b)/i,
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
      /(\b(OR|AND)\s+\d+\s*=\s*\d+)/i,
      /(\b(OR|AND)\s+'.*'\s*=\s*'.*')/i,
      /(\b(OR|AND)\s+".*"\s*=\s*".*")/i,
    ];
    
    return nosqlPatterns.some(pattern => pattern.test(input));
  },
};

// Comprehensive security validation
export function validateSecurity(input: string): {
  isSafe: boolean;
  threats: string[];
} {
  const threats: string[] = [];
  
  if (securityValidators.hasSqlInjection(input)) {
    threats.push('SQL injection');
  }
  
  if (securityValidators.hasXss(input)) {
    threats.push('XSS');
  }
  
  if (securityValidators.hasPathTraversal(input)) {
    threats.push('Path traversal');
  }
  
  if (securityValidators.hasCommandInjection(input)) {
    threats.push('Command injection');
  }
  
  if (securityValidators.hasLdapInjection(input)) {
    threats.push('LDAP injection');
  }
  
  if (securityValidators.hasNoSqlInjection(input)) {
    threats.push('NoSQL injection');
  }
  
  return {
    isSafe: threats.length === 0,
    threats,
  };
}
