import * as React from 'react';
import {ReactEditor, useSlateStatic} from 'slate-react';
import {Transforms} from 'slate';
import {ArgsPane} from '@jsonjoy.com/ui/lib/4-card/ContextMenu/ArgsPane';
import {usePopup} from '@jsonjoy.com/ui/lib/4-card/Popup/context';
import {convertLatexToAsciiMath, convertLatexToMarkup, convertLatexToMathMl} from 'mathlive';
import {useT} from 'use-t';
import {useMuTxt} from '../../../context';
import {MATH_SIZES, MATH_SIZE_LABEL, getMathSize, getStoredMathSize} from './settings';
import type {MenuItem, Param} from '@jsonjoy.com/ui/lib/4-card/StructuralMenu/types';
import type {MathElement as MathElementType, MathThing} from '../../../types';
import SizeIcon__svg from 'iconista/lib/react/bootstrap/aspect-ratio';
import CaptionIcon__svg from 'iconista/lib/react/bootstrap/chat-square-text';
import NameIcon__svg from 'iconista/lib/react/bootstrap/pen';
import LabelIcon__svg from 'iconista/lib/react/bootstrap/tag';

const SizeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <SizeIcon__svg width={16} height={16} {...props} />;
const CaptionIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <CaptionIcon__svg width={16} height={16} {...props} />;
const NameIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <NameIcon__svg width={16} height={16} {...props} />;
const LabelIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <LabelIcon__svg width={16} height={16} {...props} />;

const renderSizeIcon = () => <SizeIcon />;
const renderCaptionIcon = () => <CaptionIcon />;
const renderNameIcon = () => <NameIcon />;
const renderLabelIcon = () => <LabelIcon />;

const safeConvert = (fn: (s: string) => string, tex: string): string => {
  try {
    return fn(tex);
  } catch {
    return '';
  }
};

export interface MathOptions2Props {
  element: MathElementType;
  closePopup?: () => void;
}

export const MathOptions2: React.FC<MathOptions2Props> = ({element, closePopup}) => {
  const [t] = useT();
  const editor = useSlateStatic();
  const mutxt = useMuTxt();
  const popup = usePopup();
  mutxt.things.version.use();

  const onCancel = React.useCallback(() => {
    if (closePopup) closePopup();
    else popup?.close();
  }, [closePopup, popup]);

  const elementRef = React.useRef(element);
  elementRef.current = element;

  const thingId = element['@thing'] ?? '';
  const thing = thingId ? (mutxt.things.get(thingId) as MathThing | undefined) : undefined;
  const tex = thing?.val ?? '';

  const setElementField = React.useCallback(
    <K extends keyof MathElementType>(field: K, value: MathElementType[K] | undefined) => {
      const e = elementRef.current;
      try {
        const path = ReactEditor.findPath(editor, e);
        if (value === undefined || value === '') {
          Transforms.unsetNodes(editor, field as string, {at: path});
        } else {
          Transforms.setNodes(editor, {[field]: value} as Partial<MathElementType>, {at: path});
        }
      } catch {}
    },
    [editor],
  );

  const setThingField = React.useCallback(
    (field: 'name' | 'label', value: string | undefined) => {
      if (!thingId) return;
      const current = mutxt.things.get(thingId) as MathThing | undefined;
      if (!current) return;
      const prev = current[field] ?? '';
      const next = value ?? '';
      if (prev === next) return;
      mutxt.things.update(thingId, {[field]: next || undefined} as any);
      mutxt.sync(false);
    },
    [mutxt, thingId],
  );

  const ascii = React.useMemo(() => (tex ? safeConvert(convertLatexToAsciiMath, tex) : ''), [tex]);
  const mathMl = React.useMemo(() => (tex ? safeConvert(convertLatexToMathMl, tex) : ''), [tex]);
  const mathHtml = React.useMemo(() => (tex ? safeConvert(convertLatexToMarkup, tex) : ''), [tex]);

  const item: MenuItem = React.useMemo(
    () => ({name: t('Equation options'), compact: true}),
    [t],
  );

  const params: (Param | MenuItem)[] = React.useMemo(() => {
    const list: (Param | MenuItem)[] = [];

    list.push({
      kind: 'select',
      id: 'size',
      name: t('Size'),
      icon: renderSizeIcon,
      default: getMathSize(element.size),
      options: MATH_SIZES.map((s) => ({
        id: s,
        name: `${s} — ${MATH_SIZE_LABEL[s]}`,
      })),
    });
    list.push({
      kind: 'str',
      id: 'caption',
      name: t('Caption'),
      icon: renderCaptionIcon,
      optional: true,
      placeholder: t('Shown below the equation'),
      default: element.caption ?? '',
    });

    list.push({name: t('Reference'), heading: true, collapsible: true, initialCollapsed: true});
    list.push({
      kind: 'str',
      id: 'name',
      name: t('Name'),
      icon: renderNameIcon,
      optional: true,
      placeholder: t('e.g. Pythagorean theorem'),
      default: thing?.name ?? '',
    });
    list.push({
      kind: 'str',
      id: 'label',
      name: t('Label'),
      icon: renderLabelIcon,
      optional: true,
      placeholder: t('e.g. eq:pythagoras'),
      default: thing?.label ?? '',
    });

    if (tex) {
      list.push({name: t('Source'), heading: true, collapsible: true, initialCollapsed: false});
      list.push({
        kind: 'code',
        id: 'tex',
        name: 'LaTeX',
        variant: 'block',
        value: tex,
      });
      if (ascii) {
        list.push({
          kind: 'code',
          id: 'ascii',
          name: 'ASCII Math',
          variant: 'block',
          value: ascii,
        });
      }
      if (mathMl) {
        list.push({
          kind: 'code',
          id: 'mathMl',
          name: 'MathML',
          variant: 'block',
          value: mathMl,
        });
      }
      if (mathHtml) {
        list.push({
          kind: 'code',
          id: 'mathHtml',
          name: 'HTML',
          variant: 'block',
          value: mathHtml,
        });
      }
    }

    return list;
  }, [t, element.size, element.caption, thing?.name, thing?.label, tex, ascii, mathMl, mathHtml]);

  const onChange = React.useCallback(
    (_list: [string, unknown][], map: Record<string, unknown>) => {
      const size = getMathSize(map.size as string);
      setElementField('size', getStoredMathSize(size));

      const caption = (map.caption as string | undefined) ?? '';
      setElementField('caption', caption.trim() ? caption : undefined);

      const name = (map.name as string | undefined) ?? '';
      setThingField('name', name.trim() ? name : undefined);

      const label = (map.label as string | undefined) ?? '';
      setThingField('label', label.trim() ? label : undefined);
    },
    [setElementField, setThingField],
  );

  return (
    <ArgsPane item={item} params={params} onCancel={onCancel} onChange={onChange} minWidth={360} />
  );
};
