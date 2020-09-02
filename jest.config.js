module.exports = {
  verbose: true,
  testURL: 'http://localhost/',
  setupFiles: ['<rootDir>/src/__tests__/setup.js'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  transform: {
    '^.+\.tsx?$': 'ts-jest',
  },
  transformIgnorePatterns: [],
  testRegex: '.*/__tests__/.*\.(test|spec)\.(jsx?|tsx?)$',
};
