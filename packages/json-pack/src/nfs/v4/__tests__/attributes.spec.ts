/**
 * Test to verify GETATTR optimization and attribute metadata.
 */

import {
  parseBitmask,
  containsSetOnlyAttr,
  requiresLstat,
  REQUIRED_ATTRS,
  RECOMMENDED_ATTRS,
  GET_ONLY_ATTRS,
  SET_ONLY_ATTRS,
  STAT_ATTRS,
} from '../attributes';
import {Nfsv4Attr} from '../constants';

describe('NFSv4 Attributes', () => {
  describe('extractAttrNums', () => {
    test('extracts attribute numbers from bitmap', () => {
      const mask = [0b00000000_00000000_00000000_00000011, 0b00000000_00000000_00000000_00000001];
      const attrs = parseBitmask(mask);
      expect(attrs).toEqual(new Set([0, 1, 32]));
    });

    test('handles empty bitmap', () => {
      const attrs = parseBitmask([]);
      expect(attrs.size).toBe(0);
    });
  });

  describe('containsSetOnlyAttr', () => {
    test('detects set-only attributes', () => {
      const attrs = new Set([Nfsv4Attr.FATTR4_TIME_ACCESS_SET]);
      expect(containsSetOnlyAttr(attrs)).toBe(true);
    });

    test('returns false for get-only attributes', () => {
      const attrs = new Set([Nfsv4Attr.FATTR4_TYPE, Nfsv4Attr.FATTR4_SIZE]);
      expect(containsSetOnlyAttr(attrs)).toBe(false);
    });
  });

  describe('requiresLstat', () => {
    test('returns true when stat attributes are requested', () => {
      const attrs = new Set([Nfsv4Attr.FATTR4_SIZE, Nfsv4Attr.FATTR4_TYPE]);
      expect(requiresLstat(attrs)).toBe(true);
    });

    test('returns false when only non-stat attributes are requested', () => {
      const attrs = new Set([Nfsv4Attr.FATTR4_SUPPORTED_ATTRS, Nfsv4Attr.FATTR4_FILEHANDLE]);
      expect(requiresLstat(attrs)).toBe(false);
    });

    test('returns false for empty set', () => {
      expect(requiresLstat(new Set())).toBe(false);
    });
  });

  describe('attribute sets', () => {
    test('REQUIRED_ATTRS contains mandatory attributes', () => {
      expect(REQUIRED_ATTRS.has(Nfsv4Attr.FATTR4_SUPPORTED_ATTRS)).toBe(true);
      expect(REQUIRED_ATTRS.has(Nfsv4Attr.FATTR4_TYPE)).toBe(true);
      expect(REQUIRED_ATTRS.has(Nfsv4Attr.FATTR4_FILEHANDLE)).toBe(true);
      expect(REQUIRED_ATTRS.size).toBe(13);
    });

    test('RECOMMENDED_ATTRS contains recommended attributes', () => {
      expect(RECOMMENDED_ATTRS.has(Nfsv4Attr.FATTR4_MODE)).toBe(true);
      expect(RECOMMENDED_ATTRS.has(Nfsv4Attr.FATTR4_OWNER)).toBe(true);
      expect(RECOMMENDED_ATTRS.size).toBeGreaterThan(20);
    });

    test('GET_ONLY_ATTRS and SET_ONLY_ATTRS are disjoint', () => {
      const getOnlyArray = Array.from(GET_ONLY_ATTRS);
      const setOnlyArray = Array.from(SET_ONLY_ATTRS);
      for (let i = 0; i < getOnlyArray.length; i++) {
        expect(SET_ONLY_ATTRS.has(getOnlyArray[i])).toBe(false);
      }
      for (let i = 0; i < setOnlyArray.length; i++) {
        expect(GET_ONLY_ATTRS.has(setOnlyArray[i])).toBe(false);
      }
    });

    test('STAT_ATTRS includes file-specific attributes', () => {
      expect(STAT_ATTRS.has(Nfsv4Attr.FATTR4_TYPE)).toBe(true);
      expect(STAT_ATTRS.has(Nfsv4Attr.FATTR4_SIZE)).toBe(true);
      expect(STAT_ATTRS.has(Nfsv4Attr.FATTR4_MODE)).toBe(true);
      expect(STAT_ATTRS.has(Nfsv4Attr.FATTR4_TIME_MODIFY)).toBe(true);
    });

    test('STAT_ATTRS excludes non-stat attributes', () => {
      expect(STAT_ATTRS.has(Nfsv4Attr.FATTR4_SUPPORTED_ATTRS)).toBe(false);
      expect(STAT_ATTRS.has(Nfsv4Attr.FATTR4_FILEHANDLE)).toBe(false);
    });
  });
});
