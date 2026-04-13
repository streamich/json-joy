import * as React from 'react';
import {rule} from 'nano-theme';
import {Log} from './Log';
import {useBehaviorSubject} from '@jsonjoy.com/ui/lib/hooks/useBehaviorSubject';
import {useExplorer} from '../../context';
import {WelcomeScreen} from '../WelcomeScreen';

const blockClass = rule({
  bgi: 'radial-gradient(circle, rgba(127,127,127,.1) 1px, transparent 1px)',
  bgs: '16px 16px',
  w: '100%',
  minH: '100%',
  d: 'flex',
  flex: '1 1 auto',
});

export const MainContent: React.FC = () => {
  const state = useExplorer();
  const files = useBehaviorSubject(state.files$);

  const content = !files.length ? <WelcomeScreen /> : <Log />;

  return <div className={blockClass}>{content}</div>;
};
