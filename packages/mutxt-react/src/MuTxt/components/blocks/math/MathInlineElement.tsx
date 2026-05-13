import * as React from 'react';
import {rule} from 'nano-theme';
import {useFocused, useSelected, ReactEditor, type RenderElementProps} from 'slate-react';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import {useMuTxt} from '../../../context';
import {MathSpan} from '../../../void/math/mathlive';
import {MATH_SIZE_FONT} from './settings';
import type {MathInlineElement as MathInlineElementType, MathThing} from '../../../types';

const inlineClass = rule({
  d: 'inline-block',
  mr: 0,
  pd: '0 1px',
  bdrad: '3px',
  cursor: 'pointer',
  us: 'none',
});

const placeholderClass = rule({
  fz: '13px',
  lh: 1.4,
});

export interface MathInlineElementProps extends RenderElementProps {
  element: MathInlineElementType;
}

export const MathInlineElement: React.FC<MathInlineElementProps> = ({attributes, children, element}) => {
  const mutxt = useMuTxt();
  mutxt.things.version.use();
  const styles = useStyles();
  const isSelected = useSelected();
  const isFocused = useFocused();
  const selected = isSelected && isFocused;

  const thingId = element['@thing'];
  const thing = thingId ? (mutxt.things.get(thingId) as MathThing | undefined) : undefined;
  const tex = thing?.val ?? '';
  const size = thing?.size === 'S' ? 'S' : 'M';
  const fontSize = MATH_SIZE_FONT[size];

  const onClick = React.useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (mutxt.readOnly.value) return;
      try {
        const path = ReactEditor.findPath(mutxt.editor as ReactEditor, element);
        mutxt.inline.math.openEdit(element, path);
      } catch {}
    },
    [mutxt, element],
  );

  return (
    <span
      {...attributes}
      className={inlineClass}
      style={{
        background: selected ? 'rgba(0,127,255,.18)' : 'transparent',
        fontSize,
      }}
      onClick={onClick}
    >
      <span contentEditable={false}>
        {tex ? (
          <MathSpan tex={tex} mode="textstyle" selected={selected} focused={selected} dark={!styles.light} />
        ) : (
          <span className={placeholderClass} style={{color: styles.g(0.5)}}>
            …
          </span>
        )}
      </span>
      {children}
    </span>
  );
};
