import * as React from 'react';
import {Code} from '@jsonjoy.com/ui/lib/1-inline/Code';
import {BasicTooltip} from '@jsonjoy.com/ui/lib/4-card/BasicTooltip';
import {useT} from 'use-t';

export interface ReadonlyLabelProps {
  tooltip?: string;
}

export const ReadonlyLabel: React.FC<ReadonlyLabelProps> = ({tooltip = ''}) => {
  let element = (
    <Code gray size={-2} spacious alt>
      readonly
    </Code>
  );

  if (tooltip) {
    element = (
      <BasicTooltip nowrap renderTooltip={() => tooltip}>
        {element}
      </BasicTooltip>
    );
  }

  return element;
};

export const LogReadonlyLabel = () => {
  const [t] = useT();
  return <ReadonlyLabel tooltip={t('Log is paused')} />;
};
