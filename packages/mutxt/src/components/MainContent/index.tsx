

import * as React from 'react';
import {rule} from 'nano-theme';
import {useBehaviorSubject} from '@jsonjoy.com/ui/lib/hooks/useBehaviorSubject';
import {useExplorer} from '../../context';
import {WelcomeScreen} from '../WelcomeScreen';
import {Document} from './Document';

const blockClass = rule({
  w: '100%',
  d: 'flex',
  fld: 'column',
  flex: '1 1 0%',
  minH: 0,
});

const contentClass = rule({
  bgi: 'radial-gradient(circle, rgba(127,127,127,.1) 1px, transparent 1px)',
  bgs: '16px 16px',
  w: '100%',
  h: '100%',
  minH: 0,
  d: 'flex',
  fld: 'column',
  gap: '12px',
  flex: '1 1 auto',
  bxz: 'border-box',
  pd: '32px 0 0',
});

export const MainContent: React.FC = () => {
  const state = useExplorer();
  const file = useBehaviorSubject(state.file$);

  if (!file) {
    return (
      <div className={blockClass}>
        <div className={contentClass}>
          <WelcomeScreen />
        </div>
      </div>
    );
  }

  return (
    <div className={blockClass}>
      <div className={contentClass}>
        <Document key={file.id} file={file} />
      </div>
    </div>
  );
};
