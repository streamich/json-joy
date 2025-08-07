/**
 * Runtime patch for CBOR decoder issue #925
 * 
 * This module applies a runtime fix for the "keyDecoder is undefined" issue that occurs
 * when @jsonjoy.com/util uses problematic re-exports.
 * 
 * Issue: https://github.com/streamich/json-joy/issues/925
 * Root cause: tslib.__exportStar skips the default export when re-exporting modules
 * 
 * This fix patches the sharedCachedUtf8Decoder module at runtime to ensure the
 * default export is available.
 */

// Patch the sharedCachedUtf8Decoder module at runtime
try {
  const sharedModule = require('@jsonjoy.com/util/lib/buffers/utf8/sharedCachedUtf8Decoder');
  
  // If the default export is missing (the bug), get it from the original source
  if (!sharedModule.default) {
    const originalModule = require('@jsonjoy.com/buffers/lib/utf8/sharedCachedUtf8Decoder');
    if (originalModule.default) {
      sharedModule.default = originalModule.default;
      console.log('[json-joy] Applied runtime patch for CBOR decoder issue #925');
    }
  }
} catch (error) {
  // If the patch fails, log a warning but don't crash
  console.warn('[json-joy] Could not apply CBOR decoder patch:', (error as Error).message);
}

// Re-export everything from the original modules for convenience
export {CborDecoder} from '@jsonjoy.com/json-pack/lib/cbor/CborDecoder';
export {CborEncoder} from '@jsonjoy.com/json-pack/lib/cbor/CborEncoder';
export {CborDecoderBase} from '@jsonjoy.com/json-pack/lib/cbor/CborDecoderBase';

/**
 * Creates a CBOR decoder with the runtime patch applied
 */
export function createCborDecoder() {
  const {CborDecoder} = require('@jsonjoy.com/json-pack/lib/cbor/CborDecoder');
  return new CborDecoder();
}

/**
 * Apply the runtime patch manually if needed
 */
export function applyRuntimePatch() {
  try {
    const sharedModule = require('@jsonjoy.com/util/lib/buffers/utf8/sharedCachedUtf8Decoder');
    
    if (!sharedModule.default) {
      const originalModule = require('@jsonjoy.com/buffers/lib/utf8/sharedCachedUtf8Decoder');
      if (originalModule.default) {
        sharedModule.default = originalModule.default;
        return true;
      }
    }
    return false;
  } catch (error) {
    console.warn('[json-joy] Runtime patch failed:', (error as Error).message);
    return false;
  }
}