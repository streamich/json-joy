import type {StringOp, StringOpComponent} from './types';

export enum VALIDATE_RESULT {
  SUCCESS = 0,
  INVALID_OP = 1,
  INVALID_COMPONENT = 2,
  ADJACENT_SAME_TYPE = 3,
  NO_TRAILING_RETAIN = 4,
}

export const validate = (op: StringOp): VALIDATE_RESULT => {
  if (!(op instanceof Array)) return VALIDATE_RESULT.INVALID_OP;
  if (op.length === 0) return VALIDATE_RESULT.INVALID_OP;
  let last: StringOpComponent | undefined;
  for (let i = 0; i < op.length; i++) {
    const component = op[i];
    switch (typeof component) {
      case 'number': {
        if (!component) return VALIDATE_RESULT.INVALID_COMPONENT;
        if (component !== Math.round(component)) return VALIDATE_RESULT.INVALID_COMPONENT;
        if (component > 0) {
          const lastComponentIsRetain = typeof last === 'number' && last > 0;
          if (lastComponentIsRetain) return VALIDATE_RESULT.ADJACENT_SAME_TYPE;
        } else {
          const lastComponentIsDelete = typeof last === 'number' && last < 0;
          if (lastComponentIsDelete) return VALIDATE_RESULT.ADJACENT_SAME_TYPE;
        }
        break;
      }
      case 'string': {
        if (!component.length) return VALIDATE_RESULT.INVALID_COMPONENT;
        const lastComponentIsInsert = typeof last === 'string';
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
