import * as React from 'react';
import {formatKeys} from '../../util/keys';
import {Sidetip} from '@jsonjoy.com/ui/lib/1-inline/Sidetip';
import type {CommandDefinition} from './types';
import type {EditorState} from '../EditorState';
import Icon__svg from 'iconista/lib/react/tabler/flip-vertical';

const Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => <Icon__svg {...props} />;
const keys = ['Primary', 'Primary'];

export const cmds: ((state: EditorState) => CommandDefinition)[] = [
  () => ({
    name: 'FlipSelection',
    mono: true,
    icon: () => <Icon width={16} height={16} />,
    right: () => <Sidetip small>{formatKeys(keys)}</Sidetip>,
    // keys: ['Primary', 'Primary'],
    // cmd: 'FlipSelection',
    // group: ['Cursor'],
    domain: 'range',
    action: (state: EditorState) => {
      state.et.cursor({flip: true});
    },
  }),
];
