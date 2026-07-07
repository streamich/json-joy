import * as str from './str';

export const enum LINE_PATCH_OP_TYPE {
  /**
   * The whole line is deleted. Delete the current src line and advance the src
   * counter.
   */
  DEL = -1,

  /**
   * Lines are equal in src and dst. Keep the line in src and advance, both, src
   * and dst counters.
   */
  EQL = 0,

  /**
   * The whole line is inserted. Insert the current dst line and advance the dst
   * counter.
   */
  INS = 1,

  /**
   * The line is modified. Execute inner diff between the current src and dst
   * lines. Keep the line in src and advance the src and dst counters.
   */
  MIX = 2,
}

export type LinePatchOp = [
  type: LINE_PATCH_OP_TYPE,
  /**
   * Assignment of this operation to the line in the `src` array.
   */
  src: number,
  /**
   * Assignment of this operation to the line in the `dst` array.
   */
  dst: number,
];

export type LinePatch = LinePatchOp[];

/**
 * Aggregate character-by-character patch into a line-by-line patch.
 *
 * @param patch Character-level patch
 * @returns Line-level patch
 */
export const agg = (patch: str.Patch): str.Patch[] => {
  // console.log(patch);
  const lines: str.Patch[] = [];
  const length = patch.length;
  let line: str.Patch = [];
  const push = (type: str.PATCH_OP_TYPE, str: string) => {
    if (!str.length) return;
    const length = line.length;
    if (length) {
      const lastOp = line[length - 1];
      if (lastOp[0] === type) {
        lastOp[1] += str;
        return;
      }
    }
    line.push([type, str]);
  };
  // console.log("PATCH", patch);
  LINES: for (let i = 0; i < length; i++) {
    const op = patch[i];
    const type = op[0];
    const str = op[1];
    const index = str.indexOf('\n');
    if (index < 0) {
      push(type, str);
      continue LINES;
    } else {
      push(type, str.slice(0, index + 1));
      if (line.length) lines.push(line);
      line = [];
    }
    let prevIndex = index;
    const strLen = str.length;
    LINE: while (prevIndex < strLen) {
      const nextIndex = str.indexOf('\n', prevIndex + 1);
      if (nextIndex < 0) {
        push(type, str.slice(prevIndex + 1));
        break LINE;
      }
      lines.push([[type, str.slice(prevIndex + 1, nextIndex + 1)]]);
      prevIndex = nextIndex;
    }
  }
  if (line.length) lines.push(line);
  // console.log("LINES", lines);
  {
    const length = lines.length;
    for (let i = 0; i < length; i++) {
      const line = (lines[i] = str.normalize(lines[i]));
      const lineLength = line.length;
      NORMALIZE_LINE_START: {
        if (lineLength < 2) break NORMALIZE_LINE_START;
        const firstOp = line[0];
        const secondOp = line[1];
        const secondOpType = secondOp[0];
        if (firstOp[0] !== str.PATCH_OP_TYPE.EQL) break NORMALIZE_LINE_START;
        if (secondOpType !== str.PATCH_OP_TYPE.DEL && secondOpType !== str.PATCH_OP_TYPE.INS)
          break NORMALIZE_LINE_START;
        for (let j = 2; j < lineLength; j++) if (line[j][0] !== secondOpType) break NORMALIZE_LINE_START;
        for (let j = i + 1; j < length; j++) {
          const targetLine = (lines[j] = str.normalize(lines[j]));
          const targetLineLength = targetLine.length;
          const pfx = firstOp[1];
          let targetLineFirstOp: str.PatchOperation;
          let targetLineSecondOp: str.PatchOperation;
          if (
            targetLine.length > 1 &&
            (targetLineFirstOp = targetLine[0])[0] === secondOpType &&
            (targetLineSecondOp = targetLine[1])[0] === str.PATCH_OP_TYPE.EQL &&
            pfx === targetLineFirstOp[1]
          ) {
            line.splice(0, 1);
            secondOp[1] = pfx + secondOp[1];
            targetLineSecondOp[1] = pfx + targetLineSecondOp[1];
            targetLine.splice(0, 1);
            break NORMALIZE_LINE_START;
          } else
            for (let k = 0; k < targetLineLength; k++)
              if (targetLine[k][0] !== secondOpType) break NORMALIZE_LINE_START;
        }
      }
      NORMALIZE_LINE_END: {
        /**
         * Brings forward EQL line ending if equivalent DEL line ending exists
         * in some following line and all inbetween operations are DEL.
         *
         * From:
         *
         * ```
         * Line 1: [EQL, 'Hell'], [DEL, 'o\n']
         * Line 2: [DEL, ' wor'], [DEL, 'ld\n']
         * Line 3: [DEL, 'gog'], [EQL, 'o\n']
         * ```
         *
         * To:
         *
         * ```
         * Line 1: [EQL, 'Hello\n']
         * Line 2: [DEL, ' wor'], [DEL, 'ld\n']
         * Line 3: [DEL, 'gogo\n']
         * ```
         */
        if (line.length < 2) break NORMALIZE_LINE_END;
        const lastOp = line[line.length - 1];
        const lastOpStr = lastOp[1];
        if (lastOp[0] !== str.PATCH_OP_TYPE.DEL) break NORMALIZE_LINE_END;
        NEXT_LINE: for (let j = i + 1; j < length; j++) {
          const targetLine = (lines[j] = str.normalize(lines[j]));
          const targetLineLength = targetLine.length;
          let targetLineLastOp: str.PatchOperation;
          if (targetLineLength === 0) continue NEXT_LINE;
          if (targetLineLength === 1) {
            targetLineLastOp = targetLine[0];
            const targetLineLastOpType = targetLineLastOp[0];
            if (targetLineLastOpType === str.PATCH_OP_TYPE.DEL) continue NEXT_LINE;
            if (targetLine[0][0] !== str.PATCH_OP_TYPE.EQL) break NORMALIZE_LINE_END;
          } else {
            targetLineLastOp = targetLine[1];
            if (targetLineLength > 2) break NORMALIZE_LINE_END;
            const first = targetLine[0];
            if (first[0] !== str.PATCH_OP_TYPE.DEL) break NORMALIZE_LINE_END;
          }
          const targetLineLastOpType = targetLineLastOp[0];
          if (targetLineLastOpType === str.PATCH_OP_TYPE.DEL) continue NEXT_LINE;
          if (targetLineLastOpType !== str.PATCH_OP_TYPE.EQL) break NORMALIZE_LINE_END;
          const moveStr = targetLineLastOp[1];
          if (moveStr.length > lastOpStr.length) break NORMALIZE_LINE_END;
          if (!lastOpStr.endsWith(moveStr)) break NORMALIZE_LINE_END;
          const index = lastOpStr.length - moveStr.length;
          lastOp[1] = lastOpStr.slice(0, index);
          line.push([str.PATCH_OP_TYPE.EQL, moveStr]);
          targetLineLastOp[0] = <any>str.PATCH_OP_TYPE.DEL;
          lines[i] = str.normalize(lines[i]);
          lines[j] = str.normalize(lines[j]);
          break NORMALIZE_LINE_END;
        }
      }
    }
  }
  // console.log("NORMALIZED LINES", lines);
  return lines;
};

export const diff = (src: string[], dst: string[]): LinePatch => {
  if (!dst.length) return src.map((_, i) => [LINE_PATCH_OP_TYPE.DEL, i, -1]);
  if (!src.length) return dst.map((_, i) => [LINE_PATCH_OP_TYPE.INS, -1, i]);
  const srcTxt = src.join('\n') + '\n';
  const dstTxt = dst.join('\n') + '\n';
  if (srcTxt === dstTxt) return [];
  const strPatch = str.diff(srcTxt, dstTxt);
  const lines = agg(strPatch);
  const length = lines.length;
  const patch: LinePatch = [];
  let srcIdx = -1;
  let dstIdx = -1;
  const srcLength = src.length;
  const dstLength = dst.length;
  for (let i = 0; i < length; i++) {
    const line = lines[i];
    let lineLength = line.length;
    if (!lineLength) continue;
    const lastOp = line[lineLength - 1];
    const lastOpType = lastOp[0];
    const txt = lastOp[1];
    if (txt === '\n') line.splice(lineLength - 1, 1);
    else {
      const strLength = txt.length;
      if (txt[strLength - 1] === '\n') {
        if (strLength === 1) line.splice(lineLength - 1, 1);
        else lastOp[1] = txt.slice(0, strLength - 1);
      }
    }
    let lineType: LINE_PATCH_OP_TYPE = LINE_PATCH_OP_TYPE.EQL;
    lineLength = line.length;
    if (!lineLength) {
      if (lastOpType === str.PATCH_OP_TYPE.EQL) {
        lineType = LINE_PATCH_OP_TYPE.EQL;
        srcIdx++;
        dstIdx++;
      } else if (lastOpType === str.PATCH_OP_TYPE.INS) {
        lineType = LINE_PATCH_OP_TYPE.INS;
        dstIdx++;
      } else if (lastOpType === str.PATCH_OP_TYPE.DEL) {
        lineType = LINE_PATCH_OP_TYPE.DEL;
        srcIdx++;
      }
    } else {
      if (i + 1 === length) {
        if (srcIdx + 1 < srcLength) {
          if (dstIdx + 1 < dstLength) {
            lineType =
              lineLength === 1 && line[0][0] === str.PATCH_OP_TYPE.EQL
                ? LINE_PATCH_OP_TYPE.EQL
                : LINE_PATCH_OP_TYPE.MIX;
            srcIdx++;
            dstIdx++;
          } else {
            lineType = LINE_PATCH_OP_TYPE.DEL;
            srcIdx++;
          }
        } else {
          lineType = LINE_PATCH_OP_TYPE.INS;
          dstIdx++;
        }
      } else {
        const op = line[0];
        const type = op[0];
        if (lineLength === 1 && type === lastOpType && type === str.PATCH_OP_TYPE.EQL) {
          srcIdx++;
          dstIdx++;
        } else if (lastOpType === str.PATCH_OP_TYPE.EQL) {
          lineType = LINE_PATCH_OP_TYPE.MIX;
          srcIdx++;
          dstIdx++;
        } else if (lastOpType === str.PATCH_OP_TYPE.INS) {
          lineType = LINE_PATCH_OP_TYPE.INS;
          dstIdx++;
        } else if (lastOpType === str.PATCH_OP_TYPE.DEL) {
          lineType = LINE_PATCH_OP_TYPE.DEL;
          srcIdx++;
        }
      }
    }
    if (lineType === LINE_PATCH_OP_TYPE.EQL) {
      if (src[srcIdx] !== dst[dstIdx]) {
        lineType = LINE_PATCH_OP_TYPE.MIX;
      }
    }
    patch.push([lineType, srcIdx, dstIdx]);
  }
  // console.log("LINE PATCH", patch);
  return patch;
};

export const apply = (
  patch: LinePatch,
  onDelete: (pos: number) => void,
  onInsert: (srcPos: number, dstPos: number) => void,
  onMix: (srcPos: number, dstPos: number) => void,
) => {
  const length = patch.length;
  LOOP: for (let i = length - 1; i >= 0; i--) {
    const [type, posSrc, posDst] = patch[i];
    switch (type) {
      case LINE_PATCH_OP_TYPE.EQL:
        continue LOOP;
      case LINE_PATCH_OP_TYPE.DEL:
        onDelete(posSrc);
        break;
      case LINE_PATCH_OP_TYPE.INS:
        onInsert(posSrc, posDst);
        break;
      case LINE_PATCH_OP_TYPE.MIX:
        onMix(posSrc, posDst);
        break;
    }
  }
};
