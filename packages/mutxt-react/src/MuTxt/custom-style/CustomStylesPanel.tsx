import * as React from 'react';
import {useT} from 'use-t';
import {ArgsPane} from '@jsonjoy.com/ui/lib/4-card/ContextMenu/ArgsPane';
import {usePopup} from '@jsonjoy.com/ui/lib/4-card/Popup/context';
import {useMuTxt} from '../context';
import {DEFAULTS, FONT_OPTIONS} from './settings';
import type {MenuItem, Param} from '@jsonjoy.com/ui/lib/4-card/StructuralMenu/types';
import type {CustomStyle} from './types';
import FfIcon__svg from 'iconista/lib/react/radix/font-family';
import FzIcon__svg from 'iconista/lib/react/radix/font-size';
import FsIcon__svg from 'iconista/lib/react/tabler/stretching';
import OsIcon__svg from 'iconista/lib/react/lucide/glasses';
import LigIcon__svg from 'iconista/lib/react/lucide/ligature';
import NvIcon__svg from 'iconista/lib/react/lucide/hash';
import LhIcon__svg from 'iconista/lib/react/radix/line-height';
import LsIcon__svg from 'iconista/lib/react/radix/letter-spacing';
import WsIcon__svg from 'iconista/lib/react/radix/letter-spacing';
import KrnIcon__svg from 'iconista/lib/react/tabler/kerning';
import FwIcon__svg from 'iconista/lib/react/radix/font-bold';
import ItIcon__svg from 'iconista/lib/react/lucide/italic';
import CapsIcon__svg from 'iconista/lib/react/radix/letter-case-uppercase';
import SmcpIcon__svg from 'iconista/lib/react/radix/letter-case-lowercase';
import UoIcon__svg from 'iconista/lib/react/lucide/underline';
import DtIcon__svg from 'iconista/lib/react/lucide/highlighter';
import FgIcon__svg from 'iconista/lib/react/lucide/paintbrush';
import BgIcon__svg from 'iconista/lib/react/lucide/paint-bucket';
import BanIcon__svg from 'iconista/lib/react/lucide/ban';
import LigatureSmallIcon__svg from 'iconista/lib/react/lucide/ligature';
import SparklesIcon__svg from 'iconista/lib/react/lucide/sparkles';
import ScrollIcon__svg from 'iconista/lib/react/lucide/scroll';
import HashIcon__svg from 'iconista/lib/react/lucide/hash';
import FeatherIcon__svg from 'iconista/lib/react/lucide/feather';
import Rows2Icon__svg from 'iconista/lib/react/lucide/rows-2';
import TableIcon__svg from 'iconista/lib/react/lucide/table';
import WandIcon__svg from 'iconista/lib/react/lucide/wand-sparkles';
import EqualIcon__svg from 'iconista/lib/react/lucide/equal';

const FfIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <FfIcon__svg width={15} height={15} {...props} />;
const FzIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <FzIcon__svg width={15} height={15} {...props} />;
const FsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <FsIcon__svg width={15} height={15} {...props} />;
const OsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <OsIcon__svg width={15} height={15} {...props} />;
const LigIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <LigIcon__svg width={15} height={15} {...props} />;
const NvIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <NvIcon__svg width={15} height={15} {...props} />;
const LhIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <LhIcon__svg width={15} height={15} {...props} />;
const LsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <LsIcon__svg width={15} height={15} {...props} />;
const WsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <WsIcon__svg width={15} height={15} {...props} />;
const KrnIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <KrnIcon__svg width={15} height={15} {...props} />;
const FwIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <FwIcon__svg width={15} height={15} {...props} />;
const ItIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <ItIcon__svg width={16} height={16} {...props} />;
const CapsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <CapsIcon__svg width={15} height={15} {...props} />
);
const SmcpIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <SmcpIcon__svg width={15} height={15} {...props} />
);
const UoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <UoIcon__svg width={15} height={15} {...props} />;
const DtIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <DtIcon__svg width={15} height={15} {...props} />;
const FgIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <FgIcon__svg width={16} height={16} {...props} />;
const BgIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <BgIcon__svg width={16} height={16} {...props} />;

// Small (14px) icons used inside enum/select option lists.
const BanIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <BanIcon__svg width={14} height={14} {...props} />;
const LigatureSmallIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <LigatureSmallIcon__svg width={14} height={14} {...props} />
);
const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <SparklesIcon__svg width={14} height={14} {...props} />
);
const ScrollIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <ScrollIcon__svg width={14} height={14} {...props} />
);
const HashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <HashIcon__svg width={14} height={14} {...props} />
);
const FeatherIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <FeatherIcon__svg width={14} height={14} {...props} />
);
const Rows2Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Rows2Icon__svg width={14} height={14} {...props} />
);
const TableIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <TableIcon__svg width={14} height={14} {...props} />
);
const WandIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <WandIcon__svg width={14} height={14} {...props} />
);
const EqualIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <EqualIcon__svg width={14} height={14} {...props} />
);

/**
 * Unwrap a `defaultable` arg value. The args pane stores them as
 * `{def: boolean, value: T}` while non-defaultable keys store the raw value.
 * Returns `undefined` when the user has left the field at "default".
 */
const pick = <T,>(raw: unknown): T | undefined => {
  if (raw && typeof raw === 'object' && 'def' in (raw as object)) {
    const {def, value} = raw as {def: boolean; value: T};
    return def ? undefined : value;
  }
  return raw as T | undefined;
};

export interface CustomStylesPanelProps {
  closePopup?: () => void;
}

export const CustomStylesPanel: React.FC<CustomStylesPanelProps> = ({closePopup}) => {
  const [t] = useT();
  const mutxt = useMuTxt();
  const popup = usePopup();
  const cs = mutxt.customStyle.cs.use();

  const onCancel = React.useCallback(() => {
    if (closePopup) closePopup();
    else popup?.close();
  }, [closePopup, popup]);

  const item: MenuItem = React.useMemo(() => ({name: t('Custom Styles'), compact: true}), [t]);

  const params: (Param | MenuItem)[] = React.useMemo(() => {
    const defable = <T,>(key: keyof CustomStyle, fallback: T): {initialDef: boolean; initialValue: T; default: T} => ({
      initialDef: cs[key] === undefined,
      initialValue: cs[key] !== undefined ? (cs[key] as unknown as T) : fallback,
      default: fallback,
    });

    return [
      {name: t('Font'), heading: true, collapsible: true},
      {
        kind: 'select',
        id: 'ff',
        name: t('Typeface'),
        defaultable: true,
        searchPlaceholder: t('Find font…'),
        icon: () => <FfIcon />,
        options: FONT_OPTIONS,
        ...defable<string>('ff', DEFAULTS.ff),
      },
      {
        kind: 'num',
        id: 'fz',
        name: t('Font size'),
        defaultable: true,
        min: 6,
        max: 96,
        step: 0.1,
        decimals: 1,
        dragSensitivity: 0.1,
        dragAxis: 'y',
        icon: () => <FzIcon />,
        ...defable<number>('fz', DEFAULTS.fz),
      },
      {
        kind: 'num',
        id: 'fs',
        name: t('Font stretch'),
        defaultable: true,
        min: 50,
        max: 200,
        step: 5,
        dragSensitivity: 0.5,
        icon: () => <FsIcon />,
        ...defable<number>('fs', DEFAULTS.fs),
      },
      {
        kind: 'bool',
        id: 'os',
        name: t('Optical sizing'),
        defaultable: true,
        icon: () => <OsIcon />,
        ...defable<boolean>('os', DEFAULTS.os),
      },
      {
        kind: 'select',
        id: 'lig',
        name: t('Ligatures'),
        defaultable: true,
        icon: () => <LigIcon />,
        options: [
          {name: t('None'), id: 'none', icon: () => <BanIcon />},
          {name: t('Common'), id: 'common', icon: () => <LigatureSmallIcon />},
          {name: t('Discretionary'), id: 'discretionary', icon: () => <SparklesIcon />},
          {name: t('Historical'), id: 'historical', icon: () => <ScrollIcon />},
        ],
        ...defable<string>('lig', DEFAULTS.lig),
      },
      {
        kind: 'enum',
        id: 'nv',
        name: t('Numeric variant'),
        defaultable: true,
        icon: () => <NvIcon />,
        options: [
          {name: t('Default'), id: 'normal', icon: () => <HashIcon />},
          {name: t('Oldstyle'), id: 'oldstyle', icon: () => <FeatherIcon />},
          {name: t('Lining'), id: 'lining', icon: () => <Rows2Icon />},
          {name: t('Tabular'), id: 'tabular', icon: () => <TableIcon />},
        ],
        ...defable<string>('nv', DEFAULTS.nv),
      },

      {name: t('Spacing'), heading: true, collapsible: true},
      {
        kind: 'num',
        id: 'lh',
        name: t('Line height'),
        defaultable: true,
        min: 0.5,
        max: 3,
        step: 0.1,
        dragSensitivity: 0.01,
        dragAxis: 'y',
        icon: () => <LhIcon />,
        ...defable<number>('lh', DEFAULTS.lh),
      },
      {
        kind: 'num',
        id: 'ls',
        name: t('Letter spacing'),
        defaultable: true,
        min: -0.2,
        max: 0.4,
        step: 0.01,
        dragSensitivity: 0.005,
        icon: () => <LsIcon />,
        ...defable<number>('ls', DEFAULTS.ls),
      },
      {
        kind: 'num',
        id: 'ws',
        name: t('Word spacing'),
        defaultable: true,
        min: -0.5,
        max: 1,
        step: 0.01,
        dragSensitivity: 0.01,
        icon: () => <WsIcon />,
        ...defable<number>('ws', DEFAULTS.ws),
      },
      {
        kind: 'enum',
        id: 'krn',
        name: t('Kerning'),
        defaultable: true,
        icon: () => <KrnIcon />,
        options: [
          {name: t('Auto'), id: 'auto', icon: () => <WandIcon />},
          {name: t('Normal'), id: 'normal', icon: () => <EqualIcon />},
          {name: t('None'), id: 'none', icon: () => <BanIcon />},
        ],
        ...defable<string>('krn', DEFAULTS.krn),
      },

      {name: t('Style'), heading: true, collapsible: true},
      {
        kind: 'num',
        id: 'fw',
        name: t('Font weight'),
        defaultable: true,
        min: 100,
        max: 900,
        step: 100,
        dragSensitivity: 4,
        icon: () => <FwIcon />,
        ...defable<number>('fw', DEFAULTS.fw),
      },
      {
        kind: 'bool',
        id: 'it',
        name: t('Italic'),
        defaultable: true,
        icon: () => <ItIcon />,
        ...defable<boolean>('it', DEFAULTS.it),
      },
      {
        kind: 'bool',
        id: 'caps',
        name: t('Large caps'),
        defaultable: true,
        icon: () => <CapsIcon />,
        ...defable<boolean>('caps', DEFAULTS.caps),
      },
      {
        kind: 'bool',
        id: 'smcp',
        name: t('Small caps'),
        defaultable: true,
        icon: () => <SmcpIcon />,
        ...defable<boolean>('smcp', DEFAULTS.smcp),
      },
      {
        kind: 'num',
        id: 'uo',
        name: t('Underline offset'),
        defaultable: true,
        min: 0,
        max: 0.5,
        step: 0.01,
        decimals: 2,
        dragSensitivity: 0.0015,
        dragAxis: 'y',
        icon: () => <UoIcon />,
        ...defable<number>('uo', DEFAULTS.uo),
      },
      {
        kind: 'num',
        id: 'dt',
        name: t('Decoration width'),
        defaultable: true,
        min: 0.01,
        max: 0.3,
        step: 0.01,
        decimals: 2,
        dragAxis: 'y',
        dragSensitivity: 0.003,
        icon: () => <DtIcon />,
        ...defable<number>('dt', DEFAULTS.dt),
      },

      {name: t('Color'), heading: true, collapsible: true},
      {
        kind: 'color',
        id: 'fg',
        name: t('Text color'),
        defaultable: true,
        alpha: true,
        icon: () => <FgIcon />,
        ...defable<string>('fg', DEFAULTS.fg),
      },
      {
        kind: 'color',
        id: 'bg',
        name: t('Background'),
        defaultable: true,
        alpha: true,
        icon: () => <BgIcon />,
        ...defable<string>('bg', DEFAULTS.bg),
      },
    ];
  }, [t, cs]);

  const onChange = React.useCallback(
    (_list: [string, unknown][], map: Record<string, unknown>) => {
      const next: CustomStyle = {};
      const numKeys: (keyof CustomStyle)[] = ['fz', 'fs', 'fw', 'lh', 'ls', 'ws', 'uo', 'dt'];
      const strKeys: (keyof CustomStyle)[] = ['ff', 'lig', 'nv', 'krn', 'fg', 'bg'];
      const boolKeys: (keyof CustomStyle)[] = ['os', 'it', 'caps', 'smcp'];
      for (const k of numKeys) {
        const v = pick<number>(map[k]);
        if (v !== undefined && Number.isFinite(v)) (next as any)[k] = v;
      }
      for (const k of strKeys) {
        const v = pick<string>(map[k]);
        if (v) (next as any)[k] = v;
      }
      for (const k of boolKeys) {
        const v = pick<boolean>(map[k]);
        if (v !== undefined) (next as any)[k] = v;
      }
      mutxt.customStyle.replace(next);
    },
    [mutxt],
  );

  return <ArgsPane inline item={item} params={params} onCancel={onCancel} onChange={onChange} />;
};
