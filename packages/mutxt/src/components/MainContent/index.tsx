import * as React from 'react';
import {rule} from 'nano-theme';
import {useBehaviorSubject} from '@jsonjoy.com/ui/lib/hooks/useBehaviorSubject';
import {ErrorBoundary} from '@jsonjoy.com/ui/lib/misc/ErrorBoundary';
import {useExplorer} from '../../context';
import {WelcomeScreen} from '../WelcomeScreen';
import {Document} from './Document';
import {AppGridColumn} from '@jsonjoy.com/ui/src/7-fullscreen/AppGrid';

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
  pd: '16px 0 0',
});

export const MainContent: React.FC = () => {
  const state = useExplorer();
  const started = state.started.use();
  const files = useBehaviorSubject(state.files$);

  if (!started) return;

  if (!files.length) {
    return (
      <AppGridColumn>
        <div className={blockClass}>
          <div className={contentClass}>
            <WelcomeScreen />
          </div>
        </div>
      </AppGridColumn>
    );
  }

  return (
    <div className={blockClass}>
      <div className={contentClass}>
        {files.map((f) => (
          <ErrorBoundary key={f.id} name={`document:${f.id}`} resetKey={f.id}>
            <Document file={f} />
          </ErrorBoundary>
        ))}
      </div>
    </div>
  );
};
