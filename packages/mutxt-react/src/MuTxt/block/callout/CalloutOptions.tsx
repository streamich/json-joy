import * as React from 'react';
import {ReactEditor, useSlateStatic} from 'slate-react';
import {Transforms} from 'slate';
import {ArgsPane} from '@jsonjoy.com/ui/lib/4-card/ContextMenu/ArgsPane';
import {usePopup} from '@jsonjoy.com/ui/lib/4-card/Popup/context';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import {syncStore} from '@jsonjoy.com/ui/lib/hooks/useSyncStore';
import type {MenuItem, Param} from '@jsonjoy.com/ui/lib/4-card/StructuralMenu/types';
import {toHex} from './colors';
import {
  CALLOUT_VARIANTS,
  CALLOUT_VARIANT_LABEL,
  DEFAULT_VARIANT,
  VARIANT_ICONS,
  VARIANT_TITLE,
  type CalloutVariant,
  getCalloutVariant,
  getVariantAccent,
  isCalloutVariant,
} from './settings';
import type {CalloutElement} from '../../types';
import CharsIcon__svg from 'iconista/lib/react/tabler/letter-case';

const CharsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <CharsIcon__svg width={16} height={16} {...props} />
);

const renderCharsIcon = () => <CharsIcon />;

const variantOptionIcon = (v: CalloutVariant) => {
  const Icon = VARIANT_ICONS[v];
  return () => <Icon />;
};

interface Defaultable<T> {
  def: boolean;
  value: T;
}

const isDefaultable = <T,>(v: unknown): v is Defaultable<T> => !!v && typeof v === 'object' && 'def' in (v as object);

export interface CalloutOptionsProps {
  element: CalloutElement;
  closePopup?: () => void;
}

/**
 * Args pane for a callout. Real-time updates — no Apply/Cancel.
 */
export const CalloutOptions: React.FC<CalloutOptionsProps> = ({element, closePopup}) => {
  const editor = useSlateStatic();
  const styles = useStyles();
  const popup = usePopup();
  const onCancel = React.useCallback(() => {
    if (closePopup) closePopup();
    else popup?.close();
  }, [closePopup, popup]);

  const elementRef = React.useRef(element);
  elementRef.current = element;

  const item: MenuItem = React.useMemo(() => ({name: 'Callout options', compact: true}), []);

  const setField = React.useCallback(
    <K extends keyof CalloutElement>(field: K, value: CalloutElement[K] | undefined) => {
      const e = elementRef.current;
      try {
        const path = ReactEditor.findPath(editor, e);
        if (value === undefined || value === '') {
          Transforms.unsetNodes(editor, field as string, {at: path});
        } else {
          Transforms.setNodes(editor, {[field]: value} as Partial<CalloutElement>, {at: path});
        }
      } catch {}
    },
    [editor],
  );

  const setStringField = React.useCallback(
    (field: 'icon' | 'title', value: string | undefined) => {
      const e = elementRef.current;
      try {
        const path = ReactEditor.findPath(editor, e);
        if (value === undefined) {
          Transforms.unsetNodes(editor, field, {at: path});
        } else {
          Transforms.setNodes(editor, {[field]: value} as Partial<CalloutElement>, {at: path});
        }
      } catch {}
    },
    [editor],
  );

  const params: (Param | MenuItem)[] = React.useMemo(() => {
    const e = element;
    const variant = getCalloutVariant(e.variant);
    const variantAccent = getVariantAccent(styles, variant);
    const variantTitle = VARIANT_TITLE[variant];
    const accentHex = toHex(variantAccent);
    const list: (Param | MenuItem)[] = [];

    list.push({
      kind: 'select',
      id: 'variant',
      name: 'Type',
      default: variant,
      options: CALLOUT_VARIANTS.map((v) => ({
        id: v,
        name: CALLOUT_VARIANT_LABEL[v],
        icon: variantOptionIcon(v),
      })),
    });
    list.push({
      kind: 'color',
      id: 'color',
      name: 'Accent',
      defaultable: true,
      default: accentHex,
      alpha: false,
      initialDef: e.color === undefined,
      initialValue: e.color ? toHex(e.color) : accentHex,
    });

    list.push({name: 'sep', innerSep: true});

    list.push({
      kind: 'bool',
      id: 'hideHeader',
      name: 'Hide header',
      default: !!e.hideHeader,
    });

    const headerVisible = !e.hideHeader;
    list.push({
      kind: 'char',
      id: 'icon',
      name: 'Icon',
      icon: renderCharsIcon,
      length: 2,
      emoji: true,
      placeholder: '',
      defaultable: true,
      default: '',
      initialDef: e.icon === undefined,
      initialValue: e.icon ?? '',
      visible: syncStore(headerVisible),
    });
    list.push({
      kind: 'str',
      id: 'title',
      name: 'Title',
      placeholder: variantTitle,
      defaultable: true,
      default: variantTitle,
      initialDef: e.title === undefined,
      initialValue: e.title ?? '',
      visible: syncStore(headerVisible),
    });

    return list;
  }, [element, styles]);

  const onChange = React.useCallback(
    (_list: [string, unknown][], map: Record<string, unknown>) => {
      const variantRaw = map.variant;
      const variant = typeof variantRaw === 'string' && isCalloutVariant(variantRaw) ? variantRaw : DEFAULT_VARIANT;
      setField('variant', variant === DEFAULT_VARIANT ? undefined : variant);

      const hideHeaderRaw = map.hideHeader;
      setField('hideHeader', hideHeaderRaw ? true : undefined);

      const colorRaw = map.color;
      if (isDefaultable<string>(colorRaw)) {
        if (colorRaw.def) {
          setField('color', undefined);
        } else {
          const v = String(colorRaw.value ?? '').trim();
          setField('color', v ? toHex(v) : undefined);
        }
      } else if (typeof colorRaw === 'string' && colorRaw.trim()) {
        setField('color', toHex(colorRaw.trim()));
      } else {
        setField('color', undefined);
      }

      const iconRaw = map.icon;
      if (isDefaultable<string>(iconRaw)) {
        if (iconRaw.def) {
          setStringField('icon', undefined);
        } else {
          setStringField('icon', String(iconRaw.value ?? '').slice(0, 2));
        }
      } else if (typeof iconRaw === 'string') {
        setStringField('icon', iconRaw.slice(0, 2) || undefined);
      } else {
        setStringField('icon', undefined);
      }

      const titleRaw = map.title;
      if (isDefaultable<string>(titleRaw)) {
        setStringField('title', titleRaw.def ? undefined : String(titleRaw.value ?? ''));
      } else if (typeof titleRaw === 'string') {
        setStringField('title', titleRaw || undefined);
      } else {
        setStringField('title', undefined);
      }
    },
    [setField, setStringField],
  );

  return <ArgsPane item={item} params={params} onCancel={onCancel} onChange={onChange} minWidth={303} />;
};
