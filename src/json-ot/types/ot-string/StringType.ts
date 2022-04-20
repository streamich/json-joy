import type {StringTypeOp, StringTypeOpComponent} from "./types";

export const enum VALIDATE_RESULT {
  SUCCESS = 0,
  INVALID_OP,
  INVALID_COMPONENT,
  INVALID_STRING_COMPONENT,
  INVALID_RETAINED_DELETE_COMPONENT,
  ADJACENT_SAME_TYPE,
  NO_TRAILING_RETAIN,
}

export class StringType {
  public static validate(op: StringTypeOp): VALIDATE_RESULT {
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
          if (!component.length) return VALIDATE_RESULT.INVALID_STRING_COMPONENT;
          const lastComponentIsInsert = (typeof last === 'string');
          if (lastComponentIsInsert) return VALIDATE_RESULT.ADJACENT_SAME_TYPE;
          break;
        }
        case 'object': {
          if (!(component instanceof Array)) return VALIDATE_RESULT.INVALID_COMPONENT;
          if (component.length !== 1) return VALIDATE_RESULT.INVALID_RETAINED_DELETE_COMPONENT;
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
  }

  public static append(op: StringTypeOp, component: StringTypeOpComponent): void {
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
  }
}
