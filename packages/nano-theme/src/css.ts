import {create} from 'nano-css';
import {addon as addonCache} from 'nano-css/addon/cache';
import {addon as addonStable} from 'nano-css/addon/stable';
import {addon as addonNesting} from 'nano-css/addon/nesting';
import {addon as addonAtoms} from 'nano-css/addon/atoms';
import {addon as addonRule} from 'nano-css/addon/rule';
import {addon as addonDrule} from 'nano-css/addon/drule';
import {addon as addonKeyframes} from 'nano-css/addon/keyframes';
import {addon as addonReset} from 'nano-css/addon/reset/Normalize';
import {addon as addonResetFont} from 'nano-css/addon/reset-font';
import {addon as addonGoogleFont} from 'nano-css/addon/googleFont';

export * from 'nano-css';

const nano = create({
  pfx: 'nano-css',
});

addonCache(nano);
addonStable(nano);
addonNesting(nano);
addonAtoms(nano);
addonRule(nano);
addonDrule(nano);
addonKeyframes(nano);
addonGoogleFont(nano);

export const reset = () => {
  addonReset(nano);
  addonResetFont(nano);
};

export const put = nano.put;
export const rule = nano.rule!;
export const drule = nano.drule!;
export const keyframes = nano.keyframes!;
export const googleFont = nano.googleFont!;

export {nano};
