import {JsonCrdtDataType} from 'json-joy/lib/json-crdt-patch/constants';
import {Point} from 'json-joy/lib/json-crdt-extensions/peritext/rga/Point';
import {Range} from 'json-joy/lib/json-crdt-extensions/peritext/rga/Range';
import {Anchor} from 'json-joy/lib/json-crdt-extensions/peritext/rga/constants';
import * as id from './id';
import type {PresenceIdShorthand, PresencePoint, RgaSelection, PresenceCursor} from './types';
import type {Peritext} from 'json-joy/lib/json-crdt-extensions/peritext/Peritext';

/**
 * A stable Peritext selection in CRDT-space, represented as a tuple of `[range,
 * startIsAnchor]`, where `range` is a `Range<string>` representing the selected
 * range in the CRDT, and `startIsAnchor` is a boolean indicating whether the
 * start of the range is the anchor (true) or the head (false).
 *
 * The `Range` (start, end) ends are always ordered such that start <= end,
 * regardless of the actual selection direction. To construct the
 * range with start/end correctly ordered use `Peritext.rangeFromPoints()`.
 */
export type StablePeritextSelection = [range: Range<string>, startIsAnchor: boolean];

/**
 * Converts Peritext range-based selections to serializable DTOs for presence
 * syncing.
 *
 * @param txt The Peritext API instance.
 * @param selections Collection of Peritext range selections.
 * @returns RGA selection entry with all selections encoded as CRDT ID-based cursors.
 */
export const toDto = (txt: Peritext, selections: StablePeritextSelection[]): RgaSelection => {
  const clock = txt.model.clock;
  const sid = clock.sid;
  const strNode = txt.str;
  const nodeId: PresenceIdShorthand = id.toDto(sid, strNode.id);
  const cursors: PresenceCursor[] = [];
  for (const [range, startIsAnchor] of selections) {
    const start = range.start;
    const end = range.end;
    const anchorPt = startIsAnchor ? start : end;
    const focusPt = startIsAnchor ? end : start;
    const anchorPoint: PresencePoint = [id.toDto(sid, anchorPt.id), anchorPt.anchor as 0 | 1];
    if (range.isCollapsed()) {
      cursors.push([anchorPoint]);
    } else {
      const focusPoint: PresencePoint = [id.toDto(sid, focusPt.id), focusPt.anchor as 0 | 1];
      cursors.push([anchorPoint, focusPoint]);
    }
  }
  const selection: RgaSelection = ['', '', sid, clock.time, {}, JsonCrdtDataType.str, nodeId, cursors];
  return selection;
};

/**
 * Converts a CRDT ID-based RGA selection back to Peritext `StablePeritextSelection`
 * entries. This is the inverse of {@link toDto}.
 *
 * @param txt The Peritext instance for the target "str" node.
 * @param selection The RGA selection DTO to convert.
 * @returns Collection of `StablePeritextSelection` tuples, or an empty array if
 *     the selection type is not "str".
 */
export const fromDto = (txt: Peritext<string>, selection: RgaSelection): StablePeritextSelection[] => {
  const [_documentId, _uiLocationId, sid, _time, _meta, type, _nodeIdDto, cursors] = selection;
  const result: StablePeritextSelection[] = [];
  if (type !== JsonCrdtDataType.str) return result;
  const str = txt.str;
  for (const cursor of cursors) {
    const [anchorPointDto, focusPointDto] = cursor;
    const anchorId = id.fromDto(sid, anchorPointDto[0]);
    const anchorAnchor: Anchor = anchorPointDto[1] ?? Anchor.After;
    if (focusPointDto) {
      const focusId = id.fromDto(sid, focusPointDto[0]);
      const focusAnchor: Anchor = focusPointDto[1] ?? Anchor.After;
      const anchorPt = new Point(str, anchorId, anchorAnchor);
      const focusPt = new Point(str, focusId, focusAnchor);
      const range = txt.rangeFromPoints(anchorPt, focusPt);
      const startIsAnchor = range.start === anchorPt;
      result.push([range, startIsAnchor]);
    } else {
      const pt = new Point(str, anchorId, anchorAnchor);
      const range = new Range(str, pt, pt.clone());
      result.push([range, true]);
    }
  }
  return result;
};
