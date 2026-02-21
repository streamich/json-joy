/**
 * Test helpers for handling Node version specific features
 */

/**
 * Creates a describe block that only runs on Node 24 and higher.
 * On older Node versions, the tests are skipped.
 *
 * Usage:
 * ```ts
 * onlyNode24AndHigher('feature that requires Node 24+', () => {
 *   test('should work', () => { ... });
 * });
 * ```
 */
export function onlyNode24AndHigher(name: string, fn: () => void): void {
  const nodeVersion = parseInt(process.versions.node.split('.')[0], 10);
  if (nodeVersion >= 24) {
    describe(name, fn);
  } else {
    describe.skip(name, fn);
  }
}
