import * as React from 'react';
import {rsync} from '@jsonjoy.com/ui';
import {makeIcon} from '@jsonjoy.com/ui/lib/icons/Iconista';
import {Sidetip} from '@jsonjoy.com/ui/lib/1-inline/Sidetip';
import {formatKeys} from '../util/keys';
import type {MenuItem} from '../types';
import type {UiLifeCycles} from '@jsonjoy.com/ui/lib/types';
import type {MuTxtTranslit} from './MuTxtTranslit';

const SHOW_MAPS_KEYS = ['Primary', 'Alt', 'Shift', 't'];
const SHOW_MAPS_KEYS_FORMATTED = formatKeys(SHOW_MAPS_KEYS);

const TranslitIcon = makeIcon({set: 'tabler', icon: 'language', width: 16, height: 16});
const SchemeIcon = makeIcon({set: 'tabler', icon: 'keyboard', width: 16, height: 16});
const OffIcon = makeIcon({set: 'tabler', icon: 'circle-off', width: 16, height: 16});
const MapIcon = makeIcon({set: 'tabler', icon: 'map', width: 16, height: 16});

/** Split `"Russian (translit)"` into `["Russian", "translit"]`. */
const splitName = (name: string): [label: string, suffix: string | null] => {
  const m = /^(.+?)\s*\(([^)]+)\)\s*$/.exec(name);
  if (!m) return [name, null];
  return [m[1], m[2]];
};

export class TranslitMenu implements UiLifeCycles {
  constructor(public readonly translit: MuTxtTranslit) {}

  public start(): () => void {
    return () => {};
  }

  public build(): MenuItem {
    const t = this.translit;
    const active = rsync.comp([t.active], ([id]) => !!id);
    const offItem: MenuItem = {
      name: 'Off',
      text: 'disable turn off translit',
      icon: () => <OffIcon />,
      active: rsync.comp([t.active], ([id]) => !id),
      onSelect: () => {
        t.off();
      },
    };
    const showMapsItem: MenuItem = {
      name: 'Show maps',
      text: 'show maps overlay help mapping reference table cheatsheet',
      icon: () => <MapIcon />,
      keys: [SHOW_MAPS_KEYS_FORMATTED],
      right: () => <Sidetip small>{SHOW_MAPS_KEYS_FORMATTED}</Sidetip>,
      onSelect: () => {
        t.openMap();
      },
    };
    const schemeItems: MenuItem[] = t.list().map((scheme) => {
      const [label, suffix] = splitName(scheme.name);
      return {
        id: `translit:${scheme.id}`,
        name: label,
        text: `${scheme.id} ${scheme.language} ${scheme.script} ${scheme.name} translit phonetic`,
        icon: () => <SchemeIcon />,
        right: suffix ? () => <Sidetip small>{suffix}</Sidetip> : void 0,
        active: rsync.comp([t.active], ([id]) => id === scheme.id),
        onSelect: () => {
          t.toggle(scheme.id);
        },
      };
    });
    return {
      name: 'Transliteration',
      text: 'translit transliteration phonetic input language keyboard cyrillic',
      icon: () => <TranslitIcon />,
      active,
      children: [
        ...(t.active.value ? [offItem] : []),
        showMapsItem,
        {name: 'sep-translit', sep: true},
        ...schemeItems,
      ],
    };
  }
}
