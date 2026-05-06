import * as React from 'react';
import type {MenuItem} from '../../StructuralMenu/types';
import type {SearchMatch} from './types';
import {ContextSep} from '../ContextSep';
import {ContextSection} from '../ContextSection';

const stripNonAlpha = (s: string): string => s.replace(/[^a-z0-9]/gi, '');
const dedup = (s: string): string => s.replace(/(.)\1+/g, '$1');
const normalize = (s: string): string => dedup(stripNonAlpha(s));

/**
 * Scores how well a query matches a text string.
 * Returns 0 for no match, higher values for better matches.
 */
const scoreText = (query: string, text: string): number => {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  if (!q || !t) return 0;

  // Substring match — check exact containment first
  const subIdx = t.indexOf(q);
  if (subIdx >= 0) {
    if (t === q) return 1000; // exact full match
    if (subIdx === 0) return 900; // starts with query
    // Check word boundary
    const charBefore = t[subIdx - 1];
    if (charBefore === ' ' || charBefore === '-' || charBefore === '_') return 850;
    return 700; // substring match
  }

  // Fuzzy: match all query characters in order
  const fuzzy = (qq: string, tt: string): number => {
    let qi = 0;
    let firstIdx = -1;
    let lastIdx = -1;
    for (let ti = 0; ti < tt.length && qi < qq.length; ti++) {
      if (tt[ti] === qq[qi]) {
        if (qi === 0) firstIdx = ti;
        lastIdx = ti;
        qi++;
      }
    }
    if (qi < qq.length) return 0;
    const windowLen = lastIdx - firstIdx + 1;
    return Math.max(1, Math.round(500 * (qq.length / windowLen)));
  };

  const exact = fuzzy(q, t);
  if (exact > 0) return exact;

  // Lenient: normalize both query and text (strip punctuation, collapse doubles)
  const nq = normalize(q);
  const nt = normalize(t);
  if (nq && nt) {
    const normSub = nt.indexOf(nq);
    if (normSub >= 0) {
      if (nt === nq) return 600;
      if (normSub === 0) return 550;
      return 450;
    }
    const lenient = fuzzy(nq, nt);
    if (lenient > 0) return Math.max(1, lenient >> 1);
  }

  return 0;
};

export const findMenuItems = (root: MenuItem, query: string): SearchMatch[] => {
  const result: SearchMatch[] = [];
  query = query.trim();
  if (!query) return result;
  const find = (path: MenuItem[], curr: MenuItem) => {
    if (curr.sep) return;
    const name = curr.name || '';
    let text = curr.text || '';
    if (name) text = name + ' ' + text;
    if (curr.id) text = curr.id + ' ' + text;
    const nameScore = scoreText(query, name);
    const textScore = scoreText(query, text);
    const score = nameScore || (textScore > 0 ? Math.max(1, textScore >> 1) : 0);
    const children = curr.children;
    if (children) {
      const before = result.length;
      const newPath = [...path, curr];
      for (let i = 0; i < children.length; i++) find(newPath, children[i]);
      if (score > 0 && result.length === before) result.push({path, item: curr, score});
    } else if (score > 0) {
      result.push({path, item: curr, score});
    }
  };
  find([], root);
  if (result.length === 1 && !!result[0].item.children && result[0].item.children.length) {
    const {item, path, score} = result.pop()!;
    path.push(item);
    const children = item.children;
    if (children && children.length) {
      const length = children.length;
      for (let i = 0; i < length; i++) {
        const child = children[i];
        if (child.sep) continue;
        result.push({path, item: child, score});
      }
    }
  }
  result.sort((a, b) => {
    const scoreDiff = b.score - a.score;
    if (scoreDiff !== 0) return scoreDiff;
    const lenDiff = a.path.length - b.path.length;
    if (lenDiff !== 0) return lenDiff;
    const pathA = a.path.map((item) => item.id ?? item.name).join('!');
    const pathB = b.path.map((item) => item.id ?? item.name).join('!');
    if (pathA === pathB) {
      if (!a.item.children) return -1;
      if (!b.item.children) return 1;
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
  const flush = (withSeparator: boolean = true) => {
    const key = menu.id ?? menu.name;
    if (list && list.length) {
      nodes.push(React.createElement(ContextSection, {key: key + '-bitItemPanel', compact: true}, ...list));
      if (withSeparator) {
        nodes.push(
          <div key={key + '-bitItemSep'} style={{padding: '0 20px'}}>
            <ContextSep line />
            <ContextSep />
          </div>,
        );
      }
    }
    list = void 0;
  };
  const flushed = () => !list;
  const state = {push, flush, flushed};
  return state;
};
