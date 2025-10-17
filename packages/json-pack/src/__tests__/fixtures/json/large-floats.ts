/**
 * Large floating point numbers and edge cases that should be handled correctly
 * by JSON decoders, especially those with scientific notation (e+/e-).
 */
export default {
  // Maximum finite representable value in JavaScript
  maxValue: 1.7976931348623157e308,

  // Same value with different notations
  maxValueUppercase: '1.7976931348623157E+308',
  maxValueImplicitPlus: '1.7976931348623157e308',

  // Values that become Infinity
  overflowToInfinity:
    // biome-ignore lint: precision loss is intended
    2e308,

  // Medium range scientific notation
  mediumLarge: 1.2345e50,
  mediumSmall: 1.2345e-50,

  // Very small numbers
  verySmall: 5e-324,
  smallestNormal: 2.2250738585072014e-308,

  // Edge cases in arrays and objects
  arrayWithLargeFloats: [
    1.7976931348623157e308,
    // biome-ignore lint: precision loss is intended
    2e308, 1.2345e-50,
  ],
  objectWithLargeFloat: {
    maxValue: 1.7976931348623157e308,
    infinity:
      // biome-ignore lint: precision loss is acceptable here
      2e308,
    tiny: 5e-324,
  },

  // Mixed with other types
  mixedData: {
    numbers: [1, -1, 0, 1.7976931348623157e308, 5e-324],
    strings: ['normal', 'with spaces'],
    nested: {
      largeFloat: 1.2345e100,
      boolean: true,
      nullValue: null,
    },
  },
};
