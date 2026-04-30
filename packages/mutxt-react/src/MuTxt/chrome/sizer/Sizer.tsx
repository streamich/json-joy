import * as React from 'react';
import {Pane, SplitPane} from '@jsonjoy.com/ui/lib/5-block/SplitPane';
import {Divider} from './Divider';
import {useMuTxt} from '../../context';
import {outerClass} from './css';

export interface SizerProps {
  children: React.ReactNode;
}

export const Sizer: React.FC<SizerProps> = ({children}) => {
  const mutxt = useMuTxt();

  let content = children;

  content = (
    <SplitPane className={outerClass} divider={Divider} dividerSize={17} onEl={mutxt.sizerBox.setEl}>
      <div />
      <Pane minSize={200}>{content}</Pane>
      <div />
    </SplitPane>
  );

  return content;
};
