import * as React from 'react';
import {rule} from 'nano-theme';
import {Log} from './Log';
import {useBehaviorSubject} from '@jsonjoy.com/ui/lib/hooks/useBehaviorSubject';
import {useExplorer} from '../../context';
import {WelcomeScreen} from '../WelcomeScreen';
import {MuTxt} from 'mutxt-react';

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

const editorShellClass = rule({
  d: 'flex',
  fld: 'column',
  flex: '1 1 0%',
  bxz: 'border-box',
  pd: '0 0 16px',
  minH: 0,
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

  if (file.log.end.api.read('/@type') === 'mutxt') {
    return (
      <div className={blockClass}>
        <div className={contentClass}>
          <div className={editorShellClass}>
            <MuTxt heightFit hoverElevate />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={blockClass}>
      <div className={contentClass}>
        <Log />
      </div>
    </div>
  );
};
