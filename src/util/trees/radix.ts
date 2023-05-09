import {stringify} from '../../json-text/stringify';
import {printTree} from '../print/printTree';
import {TrieNode} from './TrieNode';
import {findOrNextLower, first, insertLeft, insertRight, next, remove as plainRemove} from './util';

const getCommonPrefixLength = (a: string, b: string): number => {
  const len = Math.min(a.length, b.length);
  let i = 0;
  for (; i < len && a[i] === b[i]; i++);
  return i;
};

/**
 * @param root Root of the Radix Tree
 * @param path Associative key to insert
 * @param value Value to insert
 * @returns Number of new nodes created
 */
export const insert = (root: TrieNode, path: string, value: unknown): number => {
  let curr: TrieNode | undefined = root;
  let k = path;
  main: while (curr) {
    let child: TrieNode | undefined = curr.children;
    if (!child) {
      curr.children = new TrieNode(k, value);
      return 1;
    }
    const char = k[0];
    let prevChild: TrieNode | undefined = undefined;
    let cmp: boolean = false;
    child: while (child) {
      prevChild = child;
      const childChar = child.k[0];
      if (childChar === char) {
        const commonPrefixLength = getCommonPrefixLength(child.k, k);
        const isChildKContained = commonPrefixLength === child.k.length;
        const isKContained = commonPrefixLength === k.length;
        const areKeysEqual = isChildKContained && isKContained;
        if (areKeysEqual) {
          child.v = value;
          return 0;
        }
        if (isChildKContained) {
          k = k.substring(commonPrefixLength);
          curr = child;
          continue main;
        }
        if (isKContained) {
          const newChild = new TrieNode(child.k.substring(commonPrefixLength), child.v);
          newChild.children = child.children;
          child.k = k.substring(0, commonPrefixLength);
          child.v = value;
          child.children = newChild;
          return 1;
        }
        if (commonPrefixLength) {
          const newChild = new TrieNode(child.k.substring(commonPrefixLength), child.v);
          newChild.children = child.children;
          child.k = child.k.substring(0, commonPrefixLength);
          child.v = undefined;
          child.children = newChild;
          curr = child;
          k = k.substring(commonPrefixLength);
          continue main;
        }
      }
      cmp = childChar > char;
      if (cmp) child = child.l;
      else child = child.r;
    }
    if (prevChild) {
      const node = new TrieNode(k, value);
      if (cmp) insertLeft(node, prevChild);
      else insertRight(node, prevChild);
      return 1;
    }
    break;
  }
  return 0;
};

/** Finds the node which matches `key`, if any. */
export const find = (node: TrieNode, key: string): undefined | TrieNode => {
  if (!key) return node;
  const len: number = key.length;
  let offset: number = 0;
  while (node) {
    /** @todo perf: inline this function call. */
    const child = findOrNextLower(node.children, key[offset], (cmp1: string, cmp2: string) =>
      cmp1[0] > cmp2[0] ? 1 : -1,
    ) as TrieNode | undefined;
    if (!child) return undefined;
    const childKey = child.k;
    const childKeyLength = childKey.length;
    let commonPrefixLength = 0;
    const limit = Math.min(childKeyLength, len - offset);
    for (
      ;
      commonPrefixLength < limit && childKey[commonPrefixLength] === key[offset + commonPrefixLength];
      commonPrefixLength++
    );
    if (!commonPrefixLength) return undefined;
    offset += commonPrefixLength;
    if (offset === len) return child;
    if (commonPrefixLength < childKeyLength) return undefined;
    node = child;
  }
  return undefined;
};

/** Finds the node which matches `key`, and returns a list of all its parents. */
export const findWithParents = (node: TrieNode, key: string): undefined | TrieNode[] => {
  if (!key) return undefined;
  const list: TrieNode[] = [node];
  const len: number = key.length;
  let offset: number = 0;
  while (node) {
    const child = findOrNextLower(node.children, key[offset], (cmp1: string, cmp2: string) =>
      cmp1[0] > cmp2[0] ? 1 : -1,
    ) as TrieNode | undefined;
    if (!child) return undefined;
    const childKey = child.k;
    const childKeyLength = childKey.length;
    let commonPrefixLength = 0;
    const limit = Math.min(childKeyLength, len - offset);
    for (
      ;
      commonPrefixLength < limit && childKey[commonPrefixLength] === key[offset + commonPrefixLength];
      commonPrefixLength++
    );
    if (!commonPrefixLength) return undefined;
    offset += commonPrefixLength;
    if (commonPrefixLength < childKeyLength) return undefined;
    list.push(child);
    if (offset === len) return list;
    node = child;
  }
  return undefined;
};

export const remove = (root: TrieNode, key: string): boolean => {
  if (!key) {
    const deleted = root.v !== undefined;
    root.v = undefined;
    return deleted;
  }
  const list = findWithParents(root, key);
  if (!list) return false;
  const length = list.length;
  const lastIndex = length - 1;
  const last = list[lastIndex];
  const deleted = last.v !== undefined;
  last.v = undefined;
  for (let i = lastIndex; i >= 1; i--) {
    const child = list[i];
    const parent = list[i - 1];
    if (child.v || child.children) break;
    parent.children = plainRemove(parent.children, child);
  }
  return deleted;
};

export const toRecord = (
  node: TrieNode | undefined,
  prefix: string = '',
  record: Record<string, unknown> = {},
): Record<string, unknown> => {
  if (!node) return record;
  prefix += node.k;
  if (node.v !== undefined) record[prefix] = node.v;
  let child = first<TrieNode>(node.children);
  if (!child) return record;
  do toRecord(child, prefix, record);
  while ((child = next<TrieNode>(child!)));
  return record;
};

export const print = (node: TrieNode, tab: string = ''): string => {
  const detailedPrint = node.v && typeof node.v === 'object' && node.v.constructor !== Object;
  const value =
    node.v && typeof node.v === 'object'
      ? Array.isArray(node.v)
        ? stringify(node.v)
        : node.v.constructor === Object
        ? stringify(node.v)
        : '' // `[${node.v.constructor.name}]`
      : node.v === undefined
      ? ''
      : stringify(node.v);
  const childrenNodes: TrieNode[] = [];
  node.forChildren((child) => childrenNodes.push(child));
  return (
    `${node.constructor.name} ${JSON.stringify(node.k)}${value ? ' = ' + value : ''}` +
    printTree(tab, [
      !detailedPrint ? null : (tab) => (node.v as any).toString(tab),
      ...childrenNodes.map((child) => (tab: string) => print(child, tab)),
    ])
  );
};
