import * as React from 'react';
import type {StrApi} from 'json-joy/lib/json-crdt';
import {CollaborativeInput} from '../../CollaborativeInput';
import {drule, useTheme} from 'nano-theme';
import {Row} from './Row';

const css = {
  input: drule({
    w: '100%',
    minW: '100%',
    maxW: '100%',
    bxz: 'border-box',
    bdrad: '4px',
    pad: '8px',
    minH: '100px',
  }),
};

export interface ContentProps {
  str: StrApi;
}

export const Content: React.FC<ContentProps> = ({str}) => {
  const theme = useTheme();

  return (
    <Row title={'Content'}>
      <CollaborativeInput
        multiline
        className={css.input({
          bd: `1px solid ${theme.g(0.9)}`,
          bg: theme.g(0.995),
        })}
        str={() => str}
      />
    </Row>
  );
};
