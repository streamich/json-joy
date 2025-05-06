import {strCnt} from "../strCnt";
import * as str from "./str";

export const enum ARR_PATCH_OP_TYPE {
  DELETE = str.PATCH_OP_TYPE.DELETE,
  EQUAL = str.PATCH_OP_TYPE.EQUAL,
  INSERT = str.PATCH_OP_TYPE.INSERT,
  DIFF = 2,
}

/**
 * The patch type for the array diff. Consists of an even length array of
 * numbers, where the first element of the pair is the operation type
 * {@link ARR_PATCH_OP_TYPE} and the second element is the length of the
 * operation.
 */
export type ArrPatch = number[];

/**
 * Matches exact lines in the source and destination arrays.
 *
 * @param src Source array of lines.
 * @param dst Destination array of lines.
 * @returns An even length array of numbers, where each pair of numbers
 *     an index in the source array and an index in the destination array.
 */
export const matchLines = (src: string[], dst: string[]): number[] => {
  let dstIndex = 0;
  const slen = src.length;
  const dlen = dst.length;
  const result: number[] = [];
  SRC: for (let srcIndex = 0; srcIndex < slen; srcIndex++) {
    const s = src[srcIndex];
    DST: for (let i = dstIndex; i < dlen; i++) {
      const d = dst[i];
      if (s === d) {
        result.push(srcIndex, i);
        dstIndex = i + 1;
        if (dstIndex >= dlen) break SRC;
        continue SRC;
      }
    }
  }
  return result;
};

const enum PARTIAL_TYPE {
  REPLACE = 8,
  NONE = 9,
}

const diffLines = (srcTxt: string, dstTxt: string): ArrPatch => {
  const arrPatch: ArrPatch = [];
  const patch = str.diff(srcTxt, dstTxt);
  if (patch.length === 1) {
    if ((patch[0][0] as unknown as ARR_PATCH_OP_TYPE) === ARR_PATCH_OP_TYPE.INSERT) {
      arrPatch.push(ARR_PATCH_OP_TYPE.INSERT, strCnt("\n", dstTxt) + 1);
      return arrPatch;
    }
  }
  const push = (type: ARR_PATCH_OP_TYPE, count: number) => {
    const length = arrPatch.length;
    if (length !== 0) {
      const lastType = arrPatch[length - 2] as unknown as ARR_PATCH_OP_TYPE;
      if (lastType === type) {
        arrPatch[length - 1] = (arrPatch[length - 1] as unknown as number) + count;
        return;
      }
    }
    arrPatch.push(type, count);
  };
  // console.log(txtSrc);
  // console.log(txtDst);
  // console.log(patch);
  const patchLen = patch.length;
  const lastOpIndex = patchLen - 1;
  let partial: ARR_PATCH_OP_TYPE | PARTIAL_TYPE = PARTIAL_TYPE.NONE;
  for (let i = 0; i <= lastOpIndex; i++) {
    const isLastOp = i === lastOpIndex;
    const op = patch[i];
    const type: ARR_PATCH_OP_TYPE = op[0] as unknown as ARR_PATCH_OP_TYPE;
    const txt = op[1];
    if (!txt) continue;
    let lineStartOffset = 0;
    if (partial !== PARTIAL_TYPE.NONE) {
      const index = txt.indexOf("\n");
      const isImmediateFlush = index === 0;
      const flushPartial = isImmediateFlush || (isLastOp && partial === ARR_PATCH_OP_TYPE.DELETE && type === ARR_PATCH_OP_TYPE.INSERT);
      if (flushPartial) {
        lineStartOffset = 1;
        if (isImmediateFlush && <any>partial === PARTIAL_TYPE.REPLACE) {
          push(ARR_PATCH_OP_TYPE.DELETE, 1);
          push(ARR_PATCH_OP_TYPE.INSERT, 1);
        } else {
          push(<ARR_PATCH_OP_TYPE>partial, 1);
        }
        partial = PARTIAL_TYPE.NONE;
      } else {
        if (index < 0 && !isLastOp) {
          partial = partial === ARR_PATCH_OP_TYPE.DELETE && (type === ARR_PATCH_OP_TYPE.INSERT) ? PARTIAL_TYPE.REPLACE : ARR_PATCH_OP_TYPE.DIFF;
          continue;
        }
        if (partial === ARR_PATCH_OP_TYPE.DELETE && type === ARR_PATCH_OP_TYPE.INSERT) {
          const lineCount = strCnt("\n", txt, lineStartOffset) + (isLastOp ? 1 : 0);      
          push(ARR_PATCH_OP_TYPE.INSERT, lineCount);
          continue;
        }
        push(ARR_PATCH_OP_TYPE.DIFF, 1);
        if (index < 0) break;
        lineStartOffset = index + 1;
        partial = PARTIAL_TYPE.NONE;
      }
    }
    const lineCount = strCnt("\n", txt, lineStartOffset) + (isLastOp ? 1 : 0);
    const isPartial = txt[txt.length - 1] !== "\n";
    if (isPartial) {
      if (partial === PARTIAL_TYPE.NONE) partial = type;
      else partial = (partial as unknown as ARR_PATCH_OP_TYPE) === type
        ? (type as unknown as ARR_PATCH_OP_TYPE) : ARR_PATCH_OP_TYPE.DIFF;
    }
    if (!lineCount) continue;
    if (type === ARR_PATCH_OP_TYPE.EQUAL) push(ARR_PATCH_OP_TYPE.EQUAL, lineCount);
    else if (type === ARR_PATCH_OP_TYPE.INSERT) push(ARR_PATCH_OP_TYPE.INSERT, lineCount);
    else push(ARR_PATCH_OP_TYPE.DELETE, lineCount);
  }
  return arrPatch;
};

export const diff = (src: string[], dst: string[]): ArrPatch => {
  // console.log(src);
  // console.log(dst);
  const matches = matchLines(src, dst);
  // console.log('MATCHES', matches);
  const length = matches.length;
  let lastSrcIndex = -1;
  let lastDstIndex = -1;
  let patch: ArrPatch = [];
  for (let i = 0; i <= length; i += 2) {
    const isLast = i === length;
    const srcIndex = isLast ? src.length : matches[i];
    const dstIndex = isLast ? dst.length : matches[i + 1];
    if (lastSrcIndex + 1 !== srcIndex && lastDstIndex + 1 === dstIndex) {
      patch.push(ARR_PATCH_OP_TYPE.DELETE, srcIndex - lastSrcIndex - 1);
    } else if (lastSrcIndex + 1 === srcIndex && lastDstIndex + 1 !== dstIndex) {
      patch.push(ARR_PATCH_OP_TYPE.INSERT, dstIndex - lastDstIndex - 1);
    } else if (lastSrcIndex + 1 !== srcIndex && lastDstIndex + 1 !== dstIndex) {
      const srcLines = src.slice(lastSrcIndex + 1, srcIndex);
      const dstLines = dst.slice(lastDstIndex + 1, dstIndex);
      const diffPatch = diffLines(srcLines.join("\n"), dstLines.join("\n"));
      if (diffPatch.length) {
        const patchLength = patch.length;
        if (patchLength > 0 && patch[patchLength - 2] === diffPatch[0]) {
          patch[patchLength - 1] += diffPatch[1];
          patch = patch.concat(diffPatch.slice(2));
        } else patch = patch.concat(diffPatch);
      }
    }
    if (isLast) break;
    if (patch.length > 0 && patch[patch.length - 2] === ARR_PATCH_OP_TYPE.EQUAL) patch[patch.length - 1]++;
    else patch.push(ARR_PATCH_OP_TYPE.EQUAL, 1);
    lastSrcIndex = srcIndex;
    lastDstIndex = dstIndex;
  }
  return patch;
};

/**
 * Applies the array patch to the source array. The source array is assumed to
 * be materialized after the patch application, i.e., the positions in the
 * patch are relative to the source array, they do not shift during the
 * application.
 *
 * @param patch Array patch to apply.
 * @param onInsert Callback for insert operations. `posSrc` is the position
 *     between the source elements, starting from 0. `posDst` is the destination
 *     element position, starting from 0.
 * @param onDelete Callback for delete operations. `pos` is the position of
 *     the source element, starting from 0.
 * @param onDiff Callback for diff operations. `posSrc` and `posDst` are the
 *     positions of the source and destination elements, respectively, starting
 *     from 0.
 */
export const apply = (
  patch: ArrPatch,
  onInsert: (posSrc: number, posDst: number, len: number) => void,
  onDelete: (pos: number, len: number) => void,
  onDiff: (posSrc: number, posDst: number, len: number) => void,
) => {
  const length = patch.length;
  let posSrc = 0;
  let posDst = 0;
  for (let i = 0; i < length; i += 2) {
    const type = patch[i] as ARR_PATCH_OP_TYPE;
    const len = patch[i + 1] as unknown as number;
    if (type === ARR_PATCH_OP_TYPE.EQUAL) {
      posSrc += len;
      posDst += len;
    } else if (type === ARR_PATCH_OP_TYPE.INSERT) {
      onInsert(posSrc, posDst, len);
      posDst += len;
    } else if (type === ARR_PATCH_OP_TYPE.DELETE) {
      onDelete(posSrc, len);
      posSrc += len;
    } else if (type === ARR_PATCH_OP_TYPE.DIFF) {
      onDiff(posSrc, posDst, len);
      posSrc += len;
      posDst += len;
    }
  }
};
