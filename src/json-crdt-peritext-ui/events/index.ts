import {PeritextEventDefaults} from './PeritextEventDefaults';
import {PeritextEventTarget} from './PeritextEventTarget';
import type {Peritext} from '../../json-crdt-extensions';

export const create = (txt: Peritext) => {
  const et = new PeritextEventTarget();
  const defaults = new PeritextEventDefaults(txt, et);
  et.defaults = defaults;
  return defaults;
};
