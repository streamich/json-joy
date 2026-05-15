import * as React from 'react';
import {rule} from 'nano-theme';
import {isTouch} from '@jsonjoy.com/ui';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import MuTxtLogo from '@jsonjoy.com/ui/lib/icons/svg/MuTxtLogo';
import {useMuTxt} from '../../context';
import {Key} from '@jsonjoy.com/ui/lib/1-inline/Key';
import type {RenderPlaceholderProps} from 'slate-react';

export const DEF_PLACEHOLDER = (
  <span style={{display: 'inline', alignItems: 'center'}}>
    Start writing in your{' '}
    <MuTxtLogo style={{margin: '-8px 0 -12px', display: 'inline-block', verticalAlign: 'middle'}} /> document
    {!isTouch && (
      <>
        &nbsp;or press <Key>Space</Key> for commands
      </>
    )}
    ...
  </span>
);

const placeholderClass = rule({
  pe: 'none',
  us: 'none',
  fz: '16px',
});

export interface PlaceholderProps extends RenderPlaceholderProps {}

export const Placeholder: React.FC<PlaceholderProps> = (props) => {
  const {attributes, children} = props;
  const styles = useStyles();
  const mutxt = useMuTxt();

  if (!children) return null;
  if (mutxt.api.block()?.type !== 'p') return null;
  if (Object.keys(mutxt.api.marks() ?? {}).length) return null;

  return (
    <span
      {...attributes}
      className={placeholderClass}
      style={{
        ...attributes.style,
        color: styles.g(0.5),
        opacity: 1,
      }}
    >
      {children}
    </span>
  );
};
