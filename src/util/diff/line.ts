import * as str from "./str";

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

  /**
   * Character-level patch.
   */
  patch: str.Patch
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
    const index = str.indexOf("\n");
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
      let nextIndex = str.indexOf("\n", prevIndex + 1);
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
  NORMALIZE_LINE_ENDINGS: {
    const length = lines.length;
    for (let i = 0; i < length; i++) {
      const line = lines[i];
      let lineLength = line.length;
      NORMALIZE_LINE_START: {
        if (lineLength < 2) break NORMALIZE_LINE_START;
        const firstOp = line[0];
        const secondOp = line[1];
        const secondOpType = secondOp[0];
        if (
          firstOp[0] === str.PATCH_OP_TYPE.EQL &&
          (secondOpType === str.PATCH_OP_TYPE.DEL ||
            secondOpType === str.PATCH_OP_TYPE.INS)
        ) {
          for (let j = 2; j < lineLength; j++)
            if (line[j][0] !== secondOpType) break NORMALIZE_LINE_START;
          for (let j = i + 1; j < length; j++) {
            const targetLine = lines[j];
            const targetLineLength = targetLine.length;
            const pfx = firstOp[1];
            let targetLineFirstOp;
            let targetLineSecondOp;
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
            } else {
              for (let k = 0; k < targetLineLength; k++)
                if (targetLine[k][0] !== secondOpType) break NORMALIZE_LINE_START;
            }
          }
        }
      }
      lineLength = line.length;
      NORMALIZE_LINE_END: {
        if (lineLength < 2) break NORMALIZE_LINE_END;
        const lastOp = line[line.length - 1];
        const lastOpStr = lastOp[1];
        const secondLastOp = line[line.length - 2];
        if (lastOp[0] === str.PATCH_OP_TYPE.DEL) {
          // if (lastOp[0] === PATCH_OP_TYPE.DELETE && secondLastOp[0] === PATCH_OP_TYPE.EQUAL) {
          for (let j = i + 1; j < length; j++) {
            const targetLine = lines[j];
            const targetLineLength = targetLine.length;
            if (targetLineLength <= 1) {
              if (targetLine[0][0] !== str.PATCH_OP_TYPE.DEL)
                break NORMALIZE_LINE_END;
            } else {
              const targetLineLastOp = targetLine[targetLine.length - 1];
              if (targetLineLastOp[0] !== str.PATCH_OP_TYPE.EQL)
                break NORMALIZE_LINE_END;
              for (let k = 0; k < targetLine.length - 1; k++)
                if (targetLine[k][0] !== str.PATCH_OP_TYPE.DEL)
                  break NORMALIZE_LINE_END;
              let keepStr = targetLineLastOp[1];
              const keepStrEndsWithNl = keepStr.endsWith("\n");
              if (!keepStrEndsWithNl) keepStr += "\n";
              if (keepStr.length > lastOpStr.length) break NORMALIZE_LINE_END;
              if (!lastOpStr.endsWith(keepStr)) break NORMALIZE_LINE_END;
              const index = lastOpStr.length - keepStr.length;
              if (index < 0) {
                (lastOp[0] as str.PATCH_OP_TYPE) = str.PATCH_OP_TYPE.EQL;
                if (secondLastOp[0] === str.PATCH_OP_TYPE.EQL) {
                  secondLastOp[1] += lastOpStr;
                  line.splice(lineLength - 1, 1);
                }
              } else if (index === 0) {
                line.splice(lineLength - 1, 1);
                if (secondLastOp[0] === str.PATCH_OP_TYPE.EQL) {
                  secondLastOp[1] += keepStr;
                } else {
                  line.push([str.PATCH_OP_TYPE.EQL, keepStr]);
                }
              } else {
                lastOp[1] = lastOpStr.slice(0, index);
                line.push([str.PATCH_OP_TYPE.EQL, keepStr]);
              }
              const targetLineSecondLastOp = targetLine[targetLine.length - 2];
              if (targetLineSecondLastOp[0] === str.PATCH_OP_TYPE.DEL) {
                targetLineSecondLastOp[1] += keepStrEndsWithNl
                  ? keepStr
                  : keepStr.slice(0, -1);
                targetLine.splice(targetLineLength - 1, 1);
              } else {
                (targetLineLastOp[0] as str.PATCH_OP_TYPE) =
                  str.PATCH_OP_TYPE.DEL;
              }
            }
          }
        }
      }
    }
  }
  // console.log("NORMALIZED LINES", lines);
  return lines;
};

export const diff = (src: string[], dst: string[]): LinePatch => {
  const srcTxt = src.join("\n") + '\n';
  const dstTxt = dst.join("\n") + '\n';
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
    if (txt === "\n") line.splice(lineLength - 1, 1);
    else {
      const strLength = txt.length;
      if (txt[strLength - 1] === "\n") {
        if (strLength === 1) line.splice(lineLength - 1, 1);
        else lastOp[1] = txt.slice(0, strLength - 1);
      }
    }
    let lineType: LINE_PATCH_OP_TYPE = LINE_PATCH_OP_TYPE.EQL;
    lineLength = line.length;
    if (i + 1 === length) {
      if (srcIdx + 1 < srcLength) {
        if (dstIdx + 1 < dstLength) {
          lineType = lineLength === 1 && line[0][0] === str.PATCH_OP_TYPE.EQL
            ? LINE_PATCH_OP_TYPE.EQL : LINE_PATCH_OP_TYPE.MIX;
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
    patch.push([lineType, srcIdx, dstIdx, line]);
  }
  return patch;
};
