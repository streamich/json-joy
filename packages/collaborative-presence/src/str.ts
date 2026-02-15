import {JsonCrdtDataType} from 'json-joy/lib/json-crdt-patch/constants';
import * as id from './id';
import type {ITimestampStruct, Model, StrApi, StrNode} from 'json-joy/lib/json-crdt';
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
    let anchor: number = 0, focus: number = -1;
    if (typeof selection === 'number') anchor = selection;
    else [anchor, focus = anchor] = selection;
    if (focus === anchor) focus = -1;
    let point: PresencePoint;
    try {
      const anchorId: ITimestampStruct = str.findId(anchor - 1);
      point = [id.toDto(sid, anchorId)];
      if (focus >= 0) {
        const focusId: ITimestampStruct = str.findId(focus - 1);
        point.push(id.toDto(sid, focusId));
      }
    } catch {
      point = [id.toDto(sid, str.node.id)];
    }
    const cursor: PresenceCursor = [point];
    cursors.push(cursor);
  }
  const selection: RgaSelection = ['', '', sid, clock.time, {}, JsonCrdtDataType.str, nodeId, cursors];
  return selection;
};

// export const fromDto = (model: Model, selection: RgaSelection): StrSelectionStrict[] => {
//   const [_documentId, _uiLocationId, sid, _time, _meta, type, nodeIdDto, cursors] = selection;
//   const selections: StrSelectionStrict[] = [];
//   if (type !== JsonCrdtDataType.str) return selections;
//   const nodeId = id.fromDto(sid, nodeIdDto);
//   const str = model.index.get(nodeId) as StrNode | undefined;
//   if (str?.name() !== 'str') return selections;
//   for (const cursor of cursors) {
//     const [anchorDto, focusDto] = cursor[0];
//     const anchorId = id.fromDto(sid, anchorDto);
//     const anchorOffset = str.findOffset(anchorId);
//     let focusOffset: number | undefined;
//     if (focusDto) {
//       const focusId = id.fromDto(sid, focusDto);
//       focusOffset = str.findOffset(focusId);
//     }
//     if (focusOffset === undefined) focusOffset = anchorOffset;
//     selections.push([anchorOffset, focusOffset]);
//   }
//   return selections;
// };
