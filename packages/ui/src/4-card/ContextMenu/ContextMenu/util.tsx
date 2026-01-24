import * as React from 'react';
import type {MenuItem} from '../../StructuralMenu/types';
import type {SearchMatch} from './types';
import {ContextSep} from '../ContextSep';
import {ContextSection} from '../ContextSection';

const ESC_REGEX = /[^a-z0-9_-]/gi;
const cleanAlphabet = (str: string): string => str.replace(ESC_REGEX, '');

const createMatcher = (query: string): ((str: string) => boolean) => {
  query = cleanAlphabet(query).toLowerCase();
  let pattern = '.*';
  for (const char of new Set(query.split(''))) pattern += char + '.*';
  const re = new RegExp(pattern, 'i');
  return (str: string) => re.test(str);
};

export const findMenuItems = (root: MenuItem, query: string): SearchMatch[] => {
  const result: SearchMatch[] = [];
  const matcher = createMatcher(query);
  const find = (path: MenuItem[], curr: MenuItem) => {
    let text = curr.text || '';
    if (curr.sep) return;
    if (curr.name) text = curr.name + ' ' + text;
    if (curr.id) text = curr.id + ' ' + text;
    if (matcher(text)) result.push({path, item: curr});
    else {
      const children = curr.children;
      if (children) {
        const newPath = [...path, curr];
        for (let i = 0; i < children.length; i++) find(newPath, children[i]);
      }
    }
  };
  find([], root);
  if (result.length === 1 && !!result[0].item.children && result[0].item.children.length) {
    const {item, path} = result.pop()!;
    path.push(item);
    const children = item.children;
    if (children && children.length) {
      const length = children.length;
      for (let i = 0; i < length; i++) {
        const child = children[i];
        if (child.sep) continue;
        result.push({path, item: child});
      }
    }
  }
  result.sort((a, b) => {
    const lenDiff = a.path.length - b.path.length;
    if (lenDiff !== 0) return lenDiff;
    const pathA = a.path.map((item) => item.id ?? item.name).join('!');
    const pathB = b.path.map((item) => item.id ?? item.name).join('!');
    if (pathA === pathB) {
      if (!a.item.children) return -1;
      if (!b.item.children) return 1;
      if (!a.item.children && !b.item.children) return a.item.name < b.item.name ? -1 : 1;
      return a.item.name < b.item.name ? -1 : 1;
    }
    return pathA < pathB ? -1 : 1;
  });
  return result;
};

export const line = (key: string, narrow?: boolean) => (
  <React.Fragment key={key + '-sep'}>
    <ContextSep />
    {narrow ? (
      <div style={{padding: '0 18px'}}>
        <ContextSep line />
      </div>
    ) : (
      <ContextSep line />
    )}
    <ContextSep />
  </React.Fragment>
);

export const bigIconsState = (nodes: React.ReactNode[], menu: MenuItem) => {
  let list: undefined | React.ReactNode[] = [];
  const push = (item: MenuItem) => list?.push(item.iconBig?.());
  const flush = () => {
    const key = menu.id ?? menu.name;
    if (list && list.length) {
      nodes.push(
        React.createElement(ContextSection, {key: key + '-bitItemPanel', compact: true}, ...list),
        <div key={key + '-bitItemSep'} style={{padding: '0 20px'}}>
          <ContextSep line />
          <ContextSep />
        </div>,
      );
    }
    list = void 0;
  };
  const flushed = () => !list;
  const state = {push, flush, flushed};
  return state;
};
