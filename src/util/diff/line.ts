import * as str from "./str";

export type LinePatch = str.Patch[];

/**
 * Aggregate character-by-character patch into a line-by-line patch.
 * 
 * @param patch Character-level patch
 * @returns Line-level patch
 */
export const agg = (patch: str.Patch): LinePatch => {
  console.log(patch);
  const lines: str.Patch[] = [];
  const length = patch.length;
  let line: str.Patch = [];
  const push = (type: str.PATCH_OP_TYPE, str: string) => {
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
      lines.push(line);
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
  console.log(lines);
  NORMALIZE_LINE_ENDINGS: {
    const length = lines.length;
    for (let i = 0; i < length; i++) {
      const line = lines[i];
      const lineLength = line.length;
      NORMALIZE_LINE_START: {
        if (lineLength < 2) break NORMALIZE_LINE_START;
        const firstOp = line[0];
        const secondOp = line[1];
        if (
          firstOp[0] === str.PATCH_OP_TYPE.EQUAL &&
          secondOp[0] === str.PATCH_OP_TYPE.DELETE
        ) {
          for (let j = 2; j < lineLength; j++)
            if (line[j][0] !== str.PATCH_OP_TYPE.DELETE) break NORMALIZE_LINE_START;
          for (let j = i + 1; j < length; j++) {
            const targetLine = lines[j];
            const targetLineLength = targetLine.length;
            if (targetLineLength <= 1) {
              if (targetLine[0][0] !== str.PATCH_OP_TYPE.DELETE)
                break NORMALIZE_LINE_START;
            } else {
              const firstTargetLineOp = targetLine[0];
              const secondTargetLineOp = targetLine[1];
              const pfx = firstOp[1];
              if (
                firstTargetLineOp[0] === str.PATCH_OP_TYPE.DELETE &&
                secondTargetLineOp[0] === str.PATCH_OP_TYPE.EQUAL &&
                pfx === firstTargetLineOp[1]
              ) {
                line.splice(0, 1);
                secondOp[1] = pfx + secondOp[1];
                targetLine.splice(0, 1);
                secondTargetLineOp[1] = pfx + secondTargetLineOp[1];
              }
            }
          }
        }
      }
      NORMALIZE_LINE_END: {
        if (lineLength < 2) break NORMALIZE_LINE_END;
        const lastOp = line[line.length - 1];
        const lastOpStr = lastOp[1];
        const secondLastOp = line[line.length - 2];
        if (lastOp[0] === str.PATCH_OP_TYPE.DELETE) {
          // if (lastOp[0] === PATCH_OP_TYPE.DELETE && secondLastOp[0] === PATCH_OP_TYPE.EQUAL) {
          for (let j = i + 1; j < length; j++) {
            const targetLine = lines[j];
            const targetLineLength = targetLine.length;
            if (targetLineLength <= 1) {
              if (targetLine[0][0] !== str.PATCH_OP_TYPE.DELETE)
                break NORMALIZE_LINE_END;
            } else {
              const targetLineLastOp = targetLine[targetLine.length - 1];
              if (targetLineLastOp[0] !== str.PATCH_OP_TYPE.EQUAL)
                break NORMALIZE_LINE_END;
              for (let k = 0; k < targetLine.length - 1; k++)
                if (targetLine[k][0] !== str.PATCH_OP_TYPE.DELETE)
                  break NORMALIZE_LINE_END;
              const keepStr = targetLineLastOp[1];
              if (keepStr.length > lastOpStr.length) break NORMALIZE_LINE_END;
              const index = lastOpStr.lastIndexOf(keepStr);
              if (index < 0) {
                (lastOp[0] as str.PATCH_OP_TYPE) = str.PATCH_OP_TYPE.EQUAL;
                if (secondLastOp[0] === str.PATCH_OP_TYPE.EQUAL) {
                  secondLastOp[1] += lastOpStr;
                  line.splice(lineLength - 1, 1);
                }
              } else {
                lastOp[1] = lastOpStr.slice(0, index);
                line.push([str.PATCH_OP_TYPE.EQUAL, keepStr]);
              }
              const targetLineSecondLastOp = targetLine[targetLine.length - 2];
              if (targetLineSecondLastOp[0] === str.PATCH_OP_TYPE.DELETE) {
                targetLineSecondLastOp[1] += keepStr;
                targetLine.splice(targetLineLength - 1, 1);
              } else {
                (targetLineLastOp[0] as str.PATCH_OP_TYPE) = str.PATCH_OP_TYPE.DELETE;
              }
            }
          }
        }
      }
    }
  }
  console.log(lines);
  return lines;
};

export const diff = (src: string, dst: string): LinePatch => {
  const strPatch = str.diff(src, dst);
  const linePatch = agg(strPatch);
  return linePatch;
};
