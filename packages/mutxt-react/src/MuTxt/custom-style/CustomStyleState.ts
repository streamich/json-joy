import {rsync, type UiLifeCycles} from '@jsonjoy.com/ui';
import {s} from 'json-joy/lib/json-crdt';
import {sanitizeCustomStyle, isEmptyCustomStyle} from './guard';
import {toInlineCss, computeFgVars} from './css';
import type {ObjApi, ObjNode} from 'json-joy/lib/json-crdt';
import type {MuTxtState} from '../state/MuTxtState';
import type {CustomStyle} from './types';

/**
 * Manages the document-level `CustomStyle` stored at `/cs` on `MuTxtState.obj`.
 */
export class CustomStyleState implements UiLifeCycles {
  public readonly cs = rsync.val<CustomStyle>({});

  private _obj?: ObjApi<ObjNode>;
  private unsub?: () => void;
  private applyUnsub?: () => void;

  private editableEl?: HTMLElement;
  private bodyEl?: HTMLElement;
  private appliedEditableProps: string[] = [];
  private appliedBodyProps: string[] = [];

  constructor(public readonly mutxt: MuTxtState) {}

  public readonly setEditableEl = (el: HTMLElement | undefined): void => {
    if (this.editableEl === el) return;
    this.editableEl = el;
    if (el) this.apply();
  };

  public readonly setBodyEl = (el: HTMLElement | undefined): void => {
    if (this.bodyEl === el) return;
    this.bodyEl = el;
    if (el) this.apply();
  };

  private apply(): void {
    const cs = this.cs.value;
    const editable = this.editableEl;
    if (editable) {
      const style = editable.style;
      for (const prop of this.appliedEditableProps) style.removeProperty(prop);
      this.appliedEditableProps = [];
      const css = toInlineCss(cs);
      for (const k in css) {
        // Skip background on the editable. The body wrapper owns it. Painting
        // here too would double up under semi-transparent bg.
        if (k === 'backgroundColor') continue;
        const v = (css as any)[k];
        if (v === undefined || v === null) continue;
        const prop = k.replace(/([A-Z])/g, '-$1').toLowerCase();
        style.setProperty(prop, String(v));
        this.appliedEditableProps.push(prop);
      }
      const fgVars = computeFgVars(cs.fg, cs.bg);
      for (const k in fgVars) {
        style.setProperty(k, fgVars[k]);
        this.appliedEditableProps.push(k);
      }
      if (cs.lh !== undefined) {
        style.setProperty('--mutxt-lh', String(cs.lh));
        this.appliedEditableProps.push('--mutxt-lh');
      }
    }
    const body = this.bodyEl;
    if (body) {
      const style = body.style;
      for (const prop of this.appliedBodyProps) style.removeProperty(prop);
      this.appliedBodyProps = [];
      if (cs.bg) {
        style.setProperty('background-color', cs.bg);
        this.appliedBodyProps.push('background-color');
      }
    }
  }

  private read(): ObjApi<ObjNode> | undefined {
    if (this._obj) return this._obj;
    const docObj = this.mutxt.obj;
    if (!docObj.has('cs')) return undefined;
    const child = docObj.obj('/cs', true);
    if (!child) return undefined;
    this._obj = child as ObjApi<ObjNode>;
    return this._obj;
  }

  private ensure(): ObjApi<ObjNode> {
    if (this._obj) return this._obj;
    const docObj = this.mutxt.obj;
    const existing = docObj.has('cs') ? docObj.obj('/cs', true) : undefined;
    if (!existing) {
      docObj.add('/cs', s.obj({}));
    }
    this._obj = docObj.obj('/cs') as ObjApi<ObjNode>;
    return this._obj;
  }

  private refresh(): void {
    const obj = this.read();
    if (!obj) {
      if (Object.keys(this.cs.value).length) this.cs.next({});
      return;
    }
    const next = sanitizeCustomStyle(obj.view()) ?? {};
    this.cs.next(next);
  }

  public start(): () => void {
    const subscribe = (target: ObjApi<ObjNode>) => target.onSubtreeChange(() => this.refresh());
    const initial = this.read();
    if (initial) {
      this.refresh();
      this.unsub = subscribe(initial);
    } else {
      const docObj = this.mutxt.obj;
      const docUnsub = docObj.onSubtreeChange(() => {
        const obj = this.read();
        if (!obj) return;
        docUnsub();
        this.unsub = subscribe(obj);
        this.refresh();
      });
      this.unsub = docUnsub;
    }
    this.applyUnsub = this.cs.subscribe(() => this.apply());
    return () => {
      this.unsub?.();
      this.unsub = undefined;
      this.applyUnsub?.();
      this.applyUnsub = undefined;
    };
  }

  public readonly setField = <K extends keyof CustomStyle>(key: K, value: CustomStyle[K] | undefined): void => {
    if (this.mutxt.readOnly.value) return;
    const current = this.cs.value;
    if (value === undefined) {
      if (current[key] === undefined) return;
      const next: CustomStyle = {...current};
      delete next[key];
      const obj = this.read();
      if (obj) obj.del([key as string]);
      this.cs.next(next);
      return;
    }
    if (current[key] === value) return;
    const obj = this.ensure();
    obj.add('/' + (key as string), value);
    this.cs.next({...current, [key]: value});
  };

  public readonly replace = (next: CustomStyle): void => {
    if (this.mutxt.readOnly.value) return;
    const current = this.cs.value;
    const keysToRemove: string[] = [];
    for (const k in current) if (!(k in next)) keysToRemove.push(k);
    if (isEmptyCustomStyle(next)) {
      const obj = this.read();
      if (obj && keysToRemove.length) obj.del(keysToRemove);
      this.cs.next({});
      return;
    }
    const obj = this.ensure();
    if (keysToRemove.length) obj.del(keysToRemove);
    obj.mergeKeys(next as any);
    this.cs.next({...next});
  };
}
