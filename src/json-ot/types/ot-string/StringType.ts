import type {StringTypeOp, StringTypeOpComponent} from "./types";

export const enum VALIDATE_RESULT {
  SUCCESS = 0,
  INVALID_OP,
  INVALID_COMPONENT,
  ADJACENT_SAME_TYPE,
  NO_TRAILING_RETAIN,
}

export const validate = (op: StringTypeOp): VALIDATE_RESULT => {
  if (!(op instanceof Array)) return VALIDATE_RESULT.INVALID_OP;
  if (op.length === 0) return VALIDATE_RESULT.INVALID_OP;
  let last: StringTypeOpComponent | undefined;
  for (let i = 0; i < op.length; i++) {
    const component = op[i];
    switch (typeof component) {
      case 'number': {
        if (!component) return VALIDATE_RESULT.INVALID_COMPONENT;
        if (component !== Math.round(component)) return VALIDATE_RESULT.INVALID_COMPONENT;
        if (component > 0) {
          const lastComponentIsRetain = (typeof last === 'number') && (last > 0);
          if (lastComponentIsRetain) return VALIDATE_RESULT.ADJACENT_SAME_TYPE;
        } else {
          const lastComponentIsDelete = (typeof last === 'number') && (last < 0);
          if (lastComponentIsDelete) return VALIDATE_RESULT.ADJACENT_SAME_TYPE;
        }
        break;
      }
      case 'string': {
        if (!component.length) return VALIDATE_RESULT.INVALID_COMPONENT;
        const lastComponentIsInsert = (typeof last === 'string');
        if (lastComponentIsInsert) return VALIDATE_RESULT.ADJACENT_SAME_TYPE;
        break;
      }
      case 'object': {
        if (!(component instanceof Array)) return VALIDATE_RESULT.INVALID_COMPONENT;
        if (component.length !== 1) return VALIDATE_RESULT.INVALID_COMPONENT;
        const lastComponentIsRetainedDelete = last instanceof Array;
        if (lastComponentIsRetainedDelete) return VALIDATE_RESULT.ADJACENT_SAME_TYPE;
        break;
      }
      default:
        return VALIDATE_RESULT.INVALID_COMPONENT;
    }
    last = component;
  }
  const isLastRetain = typeof last === 'number' && last > 0;
  if (isLastRetain) return VALIDATE_RESULT.NO_TRAILING_RETAIN;
  return VALIDATE_RESULT.SUCCESS;
};

export const append = (op: StringTypeOp, component: StringTypeOpComponent): void => {
  if (!component) return;
  if (!op.length) {
    op.push(component);
    return;
  }
  const lastIndex = op.length - 1;
  const last = op[lastIndex];
  switch (typeof component) {
    case 'number': {
      if (typeof last === 'number') {
        if (component > 0 && last > 0) op[lastIndex] = last + component;
        else if (component < 0 && last < 0) op[lastIndex] = last + component;
        else op.push(component);
      } else op.push(component);
      break;
    }
    case 'string': {
      if (typeof last === 'string') op[lastIndex] = last + component;
      else op.push(component);
      break;
    }
    case 'object': {
      if (last instanceof Array) last[0] = last + component[0];
      else op.push(component);
      break;
    }
  }
};

const componentLength = (component: StringTypeOpComponent): number => {
  switch (typeof component) {
    case 'number': return Math.abs(component);
    case 'string': return component.length;
    default: return component[0].length;
  }
};

const idDeleteComponent = (component: StringTypeOpComponent): boolean => {
  switch (typeof component) {
    case 'number': return component < 0;
    case 'object': return true;
    default: return false;
  }
};

const copyComponent = (component: StringTypeOpComponent): StringTypeOpComponent => {
  return component instanceof Array ? [component[0]] : component;
};

const trim = (op: StringTypeOp): void => {
  if (!op.length) return;
  const last = op[op.length - 1];
  const isLastRetain = typeof last === 'number' && last > 0;
  if (isLastRetain) op.pop();
};

export const normalize = (op: StringTypeOp): StringTypeOp => {
  const op2: StringTypeOp = [];
  const length = op.length;
  for (let i = 0; i < length; i++) append(op2, op[i]);
  trim(op2);
  return op2;
};

export const apply = (str: string, op: StringTypeOp): string => {
  const length = op.length;
  let res = '';
  let offset = 0;
  for (let i = 0; i < length; i++) {
    const component = op[i];
    switch (typeof component) {
      case 'number': {
        if (component > 0) {
          const end = offset + component;
          res += str.substring(offset, end);
          offset = end;
        } else offset -= component;
        break;
      }
      case 'string':
        res += component;
        break;
      case 'object':
        offset += component[0].length;
        break;
    }
  }
  return res + str.substring(offset);
};

export const compose = (op1: StringTypeOp, op2: StringTypeOp): StringTypeOp => {
  const op3: StringTypeOp = [];
  const len1 = op1.length;
  const len2 = op2.length;
  let off1 = 0;
  let i1 = 0;
  for (let i2 = 0; i2 < len2; i2++) {
    const comp2 = op2[i2];
    let doDelete = false;
    switch (typeof comp2) {
      case 'number': {
        if (comp2 > 0) {
          let length2 = comp2;
          while (length2 > 0) {
            const comp1 = i1 >= len1 ? length2 : op1[i1];
            const length1 = componentLength(comp1);
            const isDelete = idDeleteComponent(comp1);
            if (isDelete || (length2 >= (length1 - off1))) {
              if (isDelete) append(op3, copyComponent(comp1));
              else if (off1) {
                switch (typeof comp1) {
                  case 'number': append(op3, length1 - off1); break;
                  case 'string': append(op3, comp1.substring(off1)); break;
                }
              } else append(op3, comp1);
              if (!isDelete) length2 -= (length1 - off1);
              i1++;
              off1 = 0;
            } else {
              if (typeof comp1 === 'number') append(op3, length2);
              else append(op3, (comp1 as string).substring(off1, off1 + length2));
              off1 += length2;
              length2 = 0;
            }
          }
        } else doDelete = true;
        break;
      }
      case 'string': {
        append(op3, comp2);
        break;
      }
      case 'object': {
        doDelete = true;
        break;
      }
    }
    if (doDelete) {
      const isReversible = comp2 instanceof Array;
      const length2 = isReversible ? comp2[0].length : -comp2;
      let off2 = 0;
      while (off2 < length2) {
        const remaining = length2 - off2;
        const comp1 = i1 >= len1 ? remaining : op1[i1];
        const length1 = componentLength(comp1);
        const isDelete = idDeleteComponent(comp1);
        if (isDelete) {
          append(op3, copyComponent(comp1));
          i1++;
          off1 = 0;
        } else if (remaining >= (length1 - off1)) {
          const end = off2 + (length1 - off1);
          switch (typeof comp1) {
            case 'number': append(op3, isReversible ? [comp2[0].substring(off2, end)] : -length1); break;
            case 'string': {
              off2 += (length1 - off1);
              break;
            }
          }
          i1++;
          off1 = 0;
          off2 = end;
        } else {
          switch (typeof comp1) {
            case 'number': append(op3, isReversible ? [comp2[0].substring(off2)] : -remaining); break;
            // case 'string': break;
          }
          off1 += remaining;
          off2 = length2;
        }
      }
    }
  }
  if (i1 < len1 && off1) {
    const comp1 = op1[i1++];
    const isDelete = idDeleteComponent(comp1);
    if (isDelete) {
      const isReversible = comp1 instanceof Array;
      append(op3, isReversible ? [comp1[0].substring(off1)] : ((comp1 as number) + off1));
    } else {
      switch (typeof comp1) {
        case 'number': append(op3, comp1 - off1); break;
        case 'string': append(op3, comp1.substring(off1)); break;
      }
    }
  }
  for (; i1 < len1; i1++) append(op3, op1[i1]);
  trim(op3);
  return op3;
};
