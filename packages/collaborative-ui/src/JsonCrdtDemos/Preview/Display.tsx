import * as React from 'react';
import {useT} from 'use-t';
import Paper from 'nice-ui/lib/4-card/Paper';
import {useModel} from '../../hooks/useModel';
import * as demos from '../demos';
import {ClickableJsonCrdt} from 'clickable-json';
import {Space} from 'nice-ui/lib/3-list-item/Space';
import {JsonCrdtModel} from '../../JsonCrdtModel';
import {JsonCrdtModelState} from '../../JsonCrdtModel/JsonCrdtModelState';
import {MiniTitle} from 'nice-ui/lib/3-list-item/MiniTitle';
import type {OpenDemoFile} from '../JsonCrdtDemosState';
import type {Model} from 'json-joy/lib/json-crdt';

export interface DisplayProps {
  file: OpenDemoFile;
}

export const Display: React.FC<DisplayProps> = ({file}) => {
  const [t] = useT();
  const model = file.session.model as unknown as Model<any>;
  const demo = useModel(model, () => (model.s as any).demo.toView());
  // biome-ignore lint: manual dependency list
  const devtools = React.useMemo(() => {
    const devtools = new JsonCrdtModelState();
    devtools.showModel$.next(false);
    devtools.showView$.next(false);
    return devtools;
  }, [model]);

  const definition = demos.get(demo);

  return (
    <>
      <Paper contrast round={definition?.frame === 'spacious'} hoverElevate>
        {!!definition ? (
          <div style={{width: '100%', height: 'calc(max(300px, 50vh))', display: 'flex', overflowY: 'auto'}}>
            {definition.render({model})}
          </div>
        ) : (
          <div style={{padding: 32}}>
            <ClickableJsonCrdt model={model} />
          </div>
        )}
      </Paper>

      <Space size={6} />
      <MiniTitle>{t('Developer Tools')}</MiniTitle>
      <Space />
      <JsonCrdtModel
        model={model}
        state={devtools}
        renderDisplay={definition ? (model, readonly) => definition.render({model, readonly}) : undefined}
      />
    </>
  );
};
