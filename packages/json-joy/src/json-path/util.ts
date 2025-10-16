/**
 * JSONPath utility functions
 */

import type {JSONPath, AnySelector} from './types';

/**
 * Convert a JSONPath to a human-readable string representation
 */
export function jsonPathToString(jsonPath: JSONPath): string {
  let result = '$';

  for (const segment of jsonPath.segments) {
    if (segment.selectors.length === 1) {
      const selector = segment.selectors[0];
      result += selectorToString(selector);
    } else {
      // Multiple selectors (union) - not fully implemented
      result += '[' + segment.selectors.map(selectorToString).join(',') + ']';
    }
  }

  return result;
}

/**
 * Convert a selector to string representation
 */
function selectorToString(selector: AnySelector): string {
  switch (selector.type) {
    case 'name':
      return `.${selector.name}`;
    case 'index':
      return `[${selector.index}]`;
    case 'slice': {
      let sliceStr = '[';
      if (selector.start !== undefined) sliceStr += selector.start;
      sliceStr += ':';
      if (selector.end !== undefined) sliceStr += selector.end;
      if (selector.step !== undefined) sliceStr += `:${selector.step}`;
      sliceStr += ']';
      return sliceStr;
    }
    case 'wildcard':
      return '.*';
    case 'recursive-descent':
      return `..${selectorToString(selector.selector as AnySelector)}`;
    case 'filter':
      return '[?(...)]'; // Simplified representation
    default:
      return '';
  }
}

/**
 * Check if two JSONPath expressions are equivalent
 */
export function jsonPathEquals(path1: JSONPath, path2: JSONPath): boolean {
  if (path1.segments.length !== path2.segments.length) {
    return false;
  }

  for (let i = 0; i < path1.segments.length; i++) {
    const seg1 = path1.segments[i];
    const seg2 = path2.segments[i];

    if (seg1.recursive !== seg2.recursive) {
      return false;
    }

    if (seg1.selectors.length !== seg2.selectors.length) {
      return false;
    }

    for (let j = 0; j < seg1.selectors.length; j++) {
      if (!selectorEquals(seg1.selectors[j], seg2.selectors[j])) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Check if two selectors are equivalent
 */
function selectorEquals(sel1: AnySelector, sel2: AnySelector): boolean {
  if (sel1.type !== sel2.type) {
    return false;
  }

  switch (sel1.type) {
    case 'name':
      return sel1.name === (sel2 as typeof sel1).name;
    case 'index':
      return sel1.index === (sel2 as typeof sel1).index;
    case 'slice': {
      const s2 = sel2 as typeof sel1;
      return sel1.start === s2.start && sel1.end === s2.end && sel1.step === s2.step;
    }
    case 'wildcard':
      return true;
    case 'recursive-descent': {
      const rdSel = sel2 as typeof sel1;
      return selectorEquals(sel1.selector as AnySelector, rdSel.selector as AnySelector);
    }
    case 'filter':
      // For now, just return true - would need deep comparison of filter expressions
      return true;
    default:
      return false;
  }
}

/**
 * Get all property names that could be accessed by a JSONPath
 * This is a simple analysis that doesn't handle complex filters
 */
export function getAccessedProperties(jsonPath: JSONPath): string[] {
  const properties: string[] = [];

  for (const segment of jsonPath.segments) {
    for (const selector of segment.selectors) {
      if (selector.type === 'name') {
        properties.push(selector.name);
      } else if (selector.type === 'recursive-descent') {
        if (selector.selector.type === 'name') {
          const nameSelector = selector.selector as Extract<AnySelector, {type: 'name'}>;
          properties.push(nameSelector.name);
        }
      }
    }
  }

  return properties;
}
