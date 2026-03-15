import 'mathlive';
import * as React from 'react';
import {Char} from '../../web/constants';
import {useEditor} from '../context';
import {Island} from '../cursor/island/Island';
import type {Inline, InlineAttr} from 'json-joy/lib/json-crdt-extensions';
import type {Slice} from 'json-joy/lib/json-crdt-extensions';
import {IslandFrameProps} from '../cursor/island/IslandFrame';

// TODO: load these once?
// or: https://cdn.jsdelivr.net/npm/mathlive@0.109.0/mathlive-static.css
// import 'mathlive/fonts.css';
// import 'mathlive/static.css';

export interface InlineMathProps extends IslandFrameProps {
  inline: Inline;
  attr: InlineAttr;
  children: React.ReactNode;
}

export const InlineMath: React.FC<InlineMathProps> = ({inline, attr}) => {
  const editor = useEditor();

  if (!attr.isStart()) return Char.ZeroLengthSpace;

  const tex = (attr.slice as unknown as Slice<string>).text?.() ?? '';
  const content = tex || '\\placeholder{}';

  return (
    <Island
      inline={inline}
      attr={attr}
      onMouseDown={() => {
        editor.surface.headless.et.cursor({at: attr.slice, flip: true});
      }}
      under={(
        <span>aha</span>
      )}
    >
      {React.createElement('math-span', {mode: "textstyle"}, content)}
    </Island>
  );
};
