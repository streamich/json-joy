import {rsync} from '../..';
import type {MenuItem, Param} from '../StructuralMenu/types';
import type {FieldListProps} from './';
import {isMultiple, readMulti} from './components/ArgSelect/utils';
import {dateInvalid} from './date';
import {numInvalid} from './num';
import {strInvalid} from './str';

export const isParam = (entry: Param | MenuItem): entry is Param =>
  !entry.heading && !entry.sep && typeof (entry as Param).kind === 'string';

export class FieldsState {
  public args: rsync.ReactValue<Record<string, unknown>>;

  constructor(public readonly props: FieldListProps) {
    const map: Record<string, unknown> = {};
    for (const param of props.params) {
      if (!isParam(param)) continue;
      if (param.kind === 'btn' || param.kind === 'code' || param.kind === 'info') continue;
      const id = String(param.id ?? param.name);
      if (param.defaultable) {
        const def = param.initialDef ?? true;
        const value = param.initialValue !== undefined ? param.initialValue : param.default;
        map[id] = {def, value};
      } else {
        map[id] = param.default;
      }
    }
    this.args = rsync.val<Record<string, unknown>>(map);
  }

  public setValue(name: string, value: unknown) {
    const next = {...this.args.value, [name]: value};
    this.args.next(next);
    const onChange = this.props.onChange;
    if (onChange) {
      const list: [string, unknown][] = [];
      for (const param of this.props.params ?? []) {
        if (!isParam(param)) continue;
        const idOrName = param.id ?? param.name;
        list.push([idOrName, next[idOrName]]);
      }
      onChange(list, next);
    }
  }

  public canSubmit(): boolean {
    const args = this.args;
    const map = args.value;
    for (const param of this.props.params) {
      if (!isParam(param)) continue;
      if (param.kind === 'btn' || param.kind === 'code' || param.kind === 'info') continue;
      const id = param.id ?? param.name;
      const value = map[id];
      if (!param.optional && !param.defaultable && value === undefined) return false;
      if (param.readonly) continue;
      const structured = !!value && typeof value === 'object' && 'def' in (value as object);
      if (structured && (value as {def: boolean}).def) continue;
      const v = structured ? (value as {value: unknown}).value : value;
      switch (param.kind) {
        case 'str':
          if (strInvalid(param, String(v ?? ''))) return false;
          break;
        case 'num':
          if (typeof v === 'number' && numInvalid(param, v)) return false;
          break;
        case 'date':
          if (dateInvalid(param, String(v ?? ''))) return false;
          break;
        case 'select':
          if (isMultiple(param) && readMulti(value, param).length < (param.min ?? 0)) return false;
          break;
      }
    }
    return true;
  }

  public readonly onSubmit = () => {
    if (!this.canSubmit()) return;
    const list: [string, unknown][] = [];
    const {props, args} = this;
    const map = args.value;
    for (const param of props.params ?? []) {
      if (!isParam(param)) continue;
      const idOrName = param.id ?? param.name;
      list.push([idOrName, map[idOrName]]);
    }
    props.onSubmit?.(list, map);
  };
}
