import * as React from 'react';
import useWindowSize from 'react-use/lib/useWindowSize';
import {Text} from 'nice-ui/lib/1-inline/Text';
import * as demos from '../demos';
import type {OpenDemoFile} from '../JsonCrdtDemosState';
import {useModel} from '../../hooks/useModel';

export interface TitleProps {
  file: OpenDemoFile;
}

export const Title: React.FC<TitleProps> = ({file}) => {
  const {width} = useWindowSize();
  const model = file.session.model;
  const demo = useModel(model, () => (model.s as any).demo.toView());

  const isSmall = width < 1000;
  const definition = demos.get(demo);

  return (
    <div style={{padding: '16px 0 32px'}}>
      <Text as={'h1'} font={'ui2'} kind="bold" style={{fontSize: '48px', margin: '0 0 8px'}}>
        {definition?.title ?? 'Detached'}
      </Text>
    </div>
  );
};
