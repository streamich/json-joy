import {isEmpty} from '@jsonjoy.com/util/lib/isEmpty';
import {PersistedSlice} from '../peritext/slice/PersistedSlice';
import {SliceStacking} from '../peritext/slice/constants';
import type {OverlayPoint} from '../peritext/overlay/OverlayPoint';
import type {QuillDeltaAttributes} from './types';
import type {PathStep} from '@jsonjoy.com/json-pointer';

export const getAttributes = (overlayPoint: OverlayPoint): QuillDeltaAttributes | undefined => {
  const layers = overlayPoint.layers;
  const layerLength = layers.length;
  if (!layerLength) return;
  const attributes: QuillDeltaAttributes = {};
  for (let i = 0; i < layerLength; i++) {
    const slice = layers[i];
    if (!(slice instanceof PersistedSlice)) continue;
    switch (slice.stacking) {
      case SliceStacking.One: {
        const tag = slice.type() as PathStep;
        if (tag) attributes[tag] = slice.data();
        break;
      }
      case SliceStacking.Erase: {
        const tag = slice.type() as PathStep;
        if (tag) delete attributes[tag];
        break;
      }
    }
  }
  if (isEmpty(attributes)) return undefined;
  return attributes;
};

const eraseAttributes = (attr: QuillDeltaAttributes | undefined): Record<string | number, null> | undefined => {
  if (!attr) return;
  const keys = Object.keys(attr);
  const length = keys.length;
  if (!length) return;
  const erased: Record<string | number, null> = {};
  for (let i = 0; i < length; i++) erased[keys[i]] = null;
  return erased;
};

export const removeErasures = (attr: QuillDeltaAttributes | undefined): QuillDeltaAttributes | undefined => {
  if (!attr) return;
  const keys = Object.keys(attr);
  const length = keys.length;
  if (!length) return;
  const cleaned: QuillDeltaAttributes = {};
  for (let i = 0; i < length; i++) {
    const key = keys[i];
    const value = attr[key];
    if (value !== null) cleaned[key] = value;
  }
  return isEmpty(cleaned) ? undefined : cleaned;
};

export const diffAttributes = (
  oldAttributes: QuillDeltaAttributes | undefined,
  newAttributes: QuillDeltaAttributes | undefined,
): QuillDeltaAttributes | undefined => {
  if (!oldAttributes) return removeErasures(newAttributes);
  if (!newAttributes) return eraseAttributes(oldAttributes);
  const diff: QuillDeltaAttributes = {};
  const keys = Object.keys(newAttributes);
  const length = keys.length;
  for (let i = 0; i < length; i++) {
    const key = keys[i];
    const newValue = newAttributes[key];
    const oldValue = oldAttributes[key];
    if (newValue === oldValue) continue;
    diff[key] = newValue;
  }
  const oldKeys = Object.keys(oldAttributes);
  const oldLength = oldKeys.length;
  for (let i = 0; i < oldLength; i++) {
    const key = oldKeys[i];
    // tslint:disable-next-line:triple-equals
    if (newAttributes[key] !== undefined) continue;
    diff[key] = null;
  }
  if (isEmpty(diff)) return undefined;
  return diff;
};
