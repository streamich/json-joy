import * as React from 'react';
import {usePeritext} from '../../../web/react';
import {useSyncStoreOpt} from '../../../web/react/hooks';
import {DefaultRendererColors} from '../constants';
import {CommonSliceType} from '../../../../json-crdt-extensions';
import {Spoiler} from './Spoiler';
import type {InlineViewProps} from '../../../web/react/InlineView';

interface RenderInlineSelectionProps extends RenderInlineProps {
  selection: [left: 'anchor' | 'focus' | '', right: 'anchor' | 'focus' | ''];
}

const RenderInlineSelection: React.FC<RenderInlineSelectionProps> = (props) => {
  const {children, selection} = props;
  const {dom} = usePeritext();
  const focus = useSyncStoreOpt(dom?.cursor.focus) || false;

  const [left, right] = selection;
  const style: React.CSSProperties = {
    backgroundColor: focus ? DefaultRendererColors.ActiveSelection : DefaultRendererColors.InactiveSelection,
    borderRadius: left === 'anchor' ? '.25em 1px 1px .25em' : right === 'anchor' ? '1px .25em .25em 1px' : '1px',
  };

  return <span style={style}>{children}</span>;
};

export interface RenderInlineProps extends InlineViewProps {
  children: React.ReactNode;
}

export const RenderInline: React.FC<RenderInlineProps> = (props) => {
  const {inline, children} = props;

  const attr = inline.attr();
  const selection = inline.selection();

  let element = children;

  if (attr[CommonSliceType.code]) element = <code>{element}</code>;
  if (attr[CommonSliceType.mark]) element = <mark>{element}</mark>;
  if (attr[CommonSliceType.del]) element = <del>{element}</del>;
  if (attr[CommonSliceType.ins]) element = <ins>{element}</ins>;
  if (attr[CommonSliceType.sup]) element = <sup>{element}</sup>;
  if (attr[CommonSliceType.sub]) element = <sub>{element}</sub>;
  if (attr[CommonSliceType.math]) element = <code>{element}</code>;
  if (attr[CommonSliceType.kbd]) element = <kbd>{element}</kbd>;
  if (attr[CommonSliceType.spoiler]) element = <Spoiler>{element}</Spoiler>;

  if (selection) {
    element = (
      <RenderInlineSelection {...props} selection={selection}>
        {element}
      </RenderInlineSelection>
    );
  }

  return element;
};
