import * as React from 'react';
import {Pane, SplitPane} from '@jsonjoy.com/ui/lib/5-block/SplitPane';
import {rule} from 'nano-theme';
import {Divider} from './Divider';
import {useMuTxt} from '../../context';

const blockClass = rule({
  display: 'block',
});

export interface SizerProps {
  children: React.ReactNode;
}

export const Sizer: React.FC<SizerProps> = ({children}) => {
  const mutxt = useMuTxt();

  let content = children;

  content = (
    <SplitPane className={blockClass} divider={Divider} dividerSize={12} onEl={mutxt.sizerBox.setEl}>
      <div />
      <Pane minSize={200}>{content}</Pane>
      <div />
    </SplitPane>
  );

  return content;
};
