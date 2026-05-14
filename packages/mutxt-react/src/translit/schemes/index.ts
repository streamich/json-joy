import {ruTranslit} from './ru-translit';
import {ruPhonetic} from './ru-phonetic';
import {ukTranslit} from './uk-translit';
import {bgTranslit} from './bg-translit';
import {beTranslit} from './be-translit';
import {mkTranslit} from './mk-translit';
import {srTranslit} from './sr-translit';
import {elTranslit} from './el-translit';
import {heTranslit} from './he-translit';
import {hyTranslit} from './hy-translit';
import {kaTranslit} from './ka-translit';
import {eoXsystem} from './eo-xsystem';
import {viTelex} from './vi-telex';
import {arArabizi} from './ar-arabizi';
import {ipaTranslit} from './ipa-translit';
import type {TranslitScheme} from '../types';

export {
  ruTranslit,
  ruPhonetic,
  ukTranslit,
  bgTranslit,
  beTranslit,
  mkTranslit,
  srTranslit,
  elTranslit,
  heTranslit,
  hyTranslit,
  kaTranslit,
  eoXsystem,
  viTelex,
  arArabizi,
  ipaTranslit,
};

/** Schemes shipped by default, ordered roughly by reader population. */
export const defaultSchemes: readonly TranslitScheme[] = [
  ruTranslit,
  ruPhonetic,
  ukTranslit,
  bgTranslit,
  beTranslit,
  mkTranslit,
  srTranslit,
  elTranslit,
  heTranslit,
  hyTranslit,
  kaTranslit,
  arArabizi,
  viTelex,
  eoXsystem,
  ipaTranslit,
];

/** Build a `Map<id, scheme>` from an iterable of schemes. */
export const schemeMap = (schemes: Iterable<TranslitScheme>): Map<string, TranslitScheme> => {
  const m = new Map<string, TranslitScheme>();
  for (const s of schemes) m.set(s.id, s);
  return m;
};
