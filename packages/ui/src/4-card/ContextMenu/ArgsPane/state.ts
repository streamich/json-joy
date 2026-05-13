import type {ArgsPaneProps} from '.';
import type {Param, MenuItem} from '../../StructuralMenu/types';
import {rsync} from '../../..';

export const isParam = (entry: Param | MenuItem): entry is Param =>
  !entry.heading && !entry.sep && typeof (entry as Param).kind === 'string';

export class ArgsState {
  public args: rsync.ReactValue<Record<string, unknown>>;

  constructor(public readonly props: ArgsPaneProps) {
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
      if (param.optional || param.defaultable) continue;
      const id = param.id ?? param.name;
      if (map[id] === undefined) return false;
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
