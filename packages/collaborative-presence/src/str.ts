import {JsonCrdtDataType} from 'json-joy/lib/json-crdt-patch/constants';
import * as id from './id';
import type {ITimestampStruct, StrApi, StrNode, Model} from 'json-joy/lib/json-crdt';
import type {PresenceIdShorthand, PresencePoint, RgaSelection, PresenceCursor} from './types';

export type StrSelectionStrict = [anchor: number, focus?: number];

export type StrSelection =
  /** A single *caret* selection. */
  | number
  /** A *range* selection, with an anchor and focus. */
  | StrSelectionStrict;

/**
 * Converts offset-based string selections to CRDT ID-based selections. The
 * offset-based selections are relative to the current state of the string, and
 * will be converted to stable CRDT ID-based selections, which are stable across
 * concurrent edits.
 *
 * @param str The "str" node instance.
 * @param selections Collection of offset-based selections in the string.
 * @returns RGA selection entry, where all offset-based selection converted to
 *     stable CRDT ID-based selections.
 */
export const toDto = (str: StrApi, selections: StrSelection[]): RgaSelection => {
  const clock = str.api.model.clock;
  const sid = clock.sid;
  const nodeId: PresenceIdShorthand = id.toDto(sid, str.node.id);
  const cursors: PresenceCursor[] = [];
  for (let selection of selections) {
    let anchor: number = 0,
      focus: number = -1;
    if (typeof selection === 'number') anchor = selection;
    else [anchor, focus = anchor] = selection;
    if (focus === anchor) focus = -1;
    let cursor: PresenceCursor;
    try {
      const anchorId: ITimestampStruct = str.findId(anchor - 1);
      const anchorPoint: PresencePoint = [id.toDto(sid, anchorId)];
      if (focus >= 0) {
        const focusId: ITimestampStruct = str.findId(focus - 1);
        const focusPoint: PresencePoint = [id.toDto(sid, focusId)];
        cursor = [anchorPoint, focusPoint];
      } else {
        cursor = [anchorPoint];
      }
    } catch {
      cursor = [[id.toDto(sid, str.node.id)]];
    }
    cursors.push(cursor);
  }
  const selection: RgaSelection = ['', '', sid, clock.time, {}, JsonCrdtDataType.str, nodeId, cursors];
  return selection;
};

/**
 * Convert a CRDT ID to a view offset (the cursor position after that
 * character). Returns 0 when the ID matches the node itself (i.e. before
 * the first character).
 */
const findOffset = (str: StrNode, tsId: ITimestampStruct): number => {
  const nodeId = str.id;
  if (nodeId.sid === tsId.sid && nodeId.time === tsId.time) return 0;
  const chunk = str.findById(tsId);
  if (!chunk) return 0;
  const pos = str.pos(chunk);
  const charIndex = pos + (chunk.del ? 0 : tsId.time - chunk.id.time);
  return charIndex + 1;
};

/**
 * Converts a CRDT ID-based RGA selection back to offset-based string
 * selections. This is the inverse of {@link toDto}.
 *
 * @param model The JSON CRDT model containing the "str" node.
 * @param selection The RGA selection DTO to convert.
 * @returns Collection of offset-based selections, or an empty array if the
 *     node is not found or is not a "str" node.
 */
export const fromDto = (model: Model<any>, selection: RgaSelection): StrSelectionStrict[] => {
  const [_documentId, _uiLocationId, sid, _time, _meta, type, nodeIdDto, cursors] = selection;
  const result: StrSelectionStrict[] = [];
  if (type !== JsonCrdtDataType.str) return result;
  const nodeId = id.fromDto(sid, nodeIdDto);
  const str = model.index.get(nodeId) as StrNode | undefined;
  if (!str || str.name() !== 'str') return result;
  for (const cursor of cursors) {
    const [anchorPointDto, focusPointDto] = cursor;
    const anchorId = id.fromDto(sid, anchorPointDto[0]);
    const anchorOffset = findOffset(str, anchorId);
    if (focusPointDto) {
      const focusId = id.fromDto(sid, focusPointDto[0]);
      const focusOffset = findOffset(str, focusId);
      result.push([anchorOffset, focusOffset]);
    } else {
      result.push([anchorOffset]);
    }
  }
  return result;
};
