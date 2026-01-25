import * as React from 'react';
import type {JsonCrdtDemosState} from './JsonCrdtDemosState';
import {Space} from 'nice-ui/lib/3-list-item/Space';
import {Text} from 'nice-ui/lib/1-inline/Text';
import {useT} from 'use-t';
import {MiniTitle} from 'nice-ui/lib/3-list-item/MiniTitle';
import {CreateButton} from '../molecules/CreateButton';
import {DemoSelect} from './DemoSelect';
import {useWindowSize} from 'react-use';
import {Input} from 'nice-ui/lib/2-inline-block/Input';
import {Button} from 'nice-ui/lib/2-inline-block/Button';
import {FixedColumn} from 'nice-ui/lib/3-list-item/FixedColumn';

export interface LandingProps {
  state?: JsonCrdtDemosState;
}

export const Landing: React.FC<LandingProps> = ({state: _state}) => {
  const [t] = useT();
  const {width} = useWindowSize();

  const isSmall = width < 800;
  const formWidth = Math.max(300, Math.min(400, width - 64));

  return (
    <div style={{display: 'flex', width: '100%', alignItems: 'center', flexDirection: 'column'}}>
      <Text as={'h1'} size={16} font="sans" kind="bold" style={{textAlign: 'center', margin: '64px 0'}}>
        {t('Live demos')}
      </Text>
      <div style={{maxWidth: formWidth, width: '100%'}}>
        <MiniTitle>{t('New')}</MiniTitle>
        <Space size={-1} />
        <DemoSelect width={formWidth} />

        <Space size={8} />

        <MiniTitle>{t('Open')}</MiniTitle>
        <Space size={-2} />
        <FixedColumn right={128}>
          <div>
            <Space size={-1} />
            <Input label={'Link or ID'} value={''} onChange={(value) => {}} />
            <Space size={0} />
            <Button block icon={<span>🚀</span>}>
              {t('Open')}
            </Button>
          </div>
          <div style={{paddingLeft: 16}}>
            <Text as={'p'} size={-2}>
              {t('Enter a link or ID of the document you want to open.')}
            </Text>
          </div>
        </FixedColumn>
      </div>
    </div>
  );
};
