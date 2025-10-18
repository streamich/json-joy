/**
 * High-performance string format validation utilities.
 * These functions are optimized for maximum performance.
 */

/**
 * Validates if a string contains only ASCII characters (0-127).
 * This is highly optimized for performance.
 */
export const isAscii = (str: string): boolean => {
  const length = str.length;
  for (let i = 0; i < length; i++) {
    if (str.charCodeAt(i) > 127) {
      return false;
    }
  }
  return true;
};

/**
 * Validates if a string represents valid UTF-8 when encoded.
 * JavaScript strings are UTF-16, but we need to validate they don't contain
 * invalid Unicode sequences that would produce invalid UTF-8.
 *
 * This checks for:
 * - Unpaired surrogates (invalid UTF-16 sequences)
 * - Characters that would produce invalid UTF-8
 */
export const isUtf8 = (str: string): boolean => {
  const length = str.length;
  for (let i = 0; i < length; i++) {
    const code = str.charCodeAt(i);

    // Check for high surrogate
    if (code >= 0xd800 && code <= 0xdbff) {
      // High surrogate must be followed by low surrogate
      if (i + 1 >= length) {
        return false; // Unpaired high surrogate at end
      }
      const nextCode = str.charCodeAt(i + 1);
      if (nextCode < 0xdc00 || nextCode > 0xdfff) {
        return false; // High surrogate not followed by low surrogate
      }
      i++; // Skip the low surrogate
    } else if (code >= 0xdc00 && code <= 0xdfff) {
      // Low surrogate without preceding high surrogate
      return false;
    }
    // All other characters (0x0000-0xD7FF and 0xE000-0xFFFF) are valid
  }
  return true;
};

/**
 * Validates a string according to the specified format.
 */
export const validateStringFormat = (str: string, format: 'ascii' | 'utf8'): boolean => {
  switch (format) {
    case 'ascii':
      return isAscii(str);
    case 'utf8':
      return isUtf8(str);
    default:
      return true;
  }
};
