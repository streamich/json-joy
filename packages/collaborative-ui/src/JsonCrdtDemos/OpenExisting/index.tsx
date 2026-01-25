import * as React from 'react';
import {Input} from 'nice-ui/lib/2-inline-block/Input';
import {Text} from 'nice-ui/lib/1-inline/Text';
import {useT} from 'use-t';
import useWindowSize from 'react-use/lib/useWindowSize';
import {Button} from 'nice-ui/lib/2-inline-block/Button';
import {Space} from 'nice-ui/lib/3-list-item/Space';
import {SideTextLayout} from '../SideTextLayout';

export type NewGridProps = Record<string, never>;

export const OpenExisting: React.FC<NewGridProps> = () => {
  const {width} = useWindowSize();
  const [t] = useT();

  const isSmall = width < 800;

  return (
    <SideTextLayout
      title={t('Open existing')}
      left={
        <Text as={'p'} size={-2}>
          {t('Enter here the link or ID of the document you want to open.')}
        </Text>
      }
      right={
        <div style={{padding: `${isSmall ? 24 : 16}px 0 0`, maxWidth: 400}}>
          <Input label={'Link or ID'} value={''} onChange={(value) => {}} />
          <Space size={isSmall ? -1 : 1} />
          <Button icon={<span>🚀</span>}>{t('Open')}</Button>
        </div>
      }
    />
  );
};
