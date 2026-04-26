import * as React from 'react';
import {rule, drule, useTheme} from 'nano-theme';
import {Path, Range, type Text} from 'slate';
import {ReactEditor, useSlateSelection} from 'slate-react';
import {useMuTxt} from '../../context';

const blockClass = drule({
  bg: '#222',
  col: 'transparent',
});

const radius = 'calc(min(3px,.15em))';

const startClass = rule({
  borderTopLeftRadius: radius,
  borderBottomLeftRadius: radius,
});

const endClass = rule({
  borderTopRightRadius: radius,
  borderBottomRightRadius: radius,
});

export interface SpoilerProps {
  text: Text;
  children: React.ReactNode;
}

export const Spoiler: React.FC<SpoilerProps> = (props) => {
  const {text, children} = props;
  const theme = useTheme();
  const mutxt = useMuTxt();
  const selection = useSlateSelection();

  let isRevealed = false;
  if (selection && Range.isCollapsed(selection)) {
    try {
      const path = ReactEditor.findPath(mutxt.editor, text);
      if (Path.equals(selection.anchor.path, path)) isRevealed = true;
    } catch {}
  }

  const className =
    blockClass({
      bg: isRevealed ? theme.g(0.2, 0.1) : '#222',
      col: isRevealed ? 'inherit' : 'transparent',
      '& *': {
        col: isRevealed ? 'inherit' : 'transparent',
      },
    }) + startClass + endClass;

  return <span className={className}>{children}</span>;
};
