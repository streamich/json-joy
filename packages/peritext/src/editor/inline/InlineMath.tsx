import 'mathlive';
import * as React from 'react';
import {Char} from '../../web/constants';
import {useEditor} from '../context';
import {Island} from '../cursor/island/Island';
import {IslandFrameProps} from '../cursor/island/IslandFrame';
import {rule} from 'nano-theme';
import type {Inline, InlineAttr} from 'json-joy/lib/json-crdt-extensions';
import type {Slice} from 'json-joy/lib/json-crdt-extensions';

const equationClass = rule({
  cur: 'pointer',
  '& *': {
    cur: 'pointer',
  },
  '&::part(content)': {
    cur: 'pointer',
  },
});

const equationSelectedClass = rule({
  '&::part(render)': {
    bg: 'var(--selection-color)',
    bdrad: '2px',
  },
});

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

  return (
    <Island
      inline={inline}
      attr={attr}
      onMouseDown={() => {
        editor.et.cursor({at: attr.slice, flip: true});
      }}
      className={equationClass}
      under={(
        <span>aha</span>
      )}
    >
      {React.createElement('math-span', {mode: "textstyle", className: equationClass + (inline.isSelected() ? equationSelectedClass : '')}, tex)}
    </Island>
  );
};
