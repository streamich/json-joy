import type {Model} from 'json-joy/lib/json-crdt';
import * as React from 'react';
import {ClickableJsonCrdt} from 'clickable-json';
import {rule} from 'nano-theme';
import {JsonCrdtNodePreviewById} from '../../JsonCrdtNodePreview';
import {useModelTick} from '../../hooks/useModelTick';
import useWindowSize from 'react-use/lib/useWindowSize';

const css = {
  clickable: rule({
    mr: 0,
    pd: '1px 8px 8px 24px',
  }),
};

export interface JsonCrdtModelClickableProps {
  model: Model<any>;
  readonly?: boolean;
}

export const JsonCrdtModelClickable: React.FC<JsonCrdtModelClickableProps> = ({model, readonly}) => {
  const {width} = useWindowSize();
  const [focused, setFocused] = React.useState<null | string>(null);
  useModelTick(model);

  let preview: React.ReactNode = null;

  if (focused) {
    preview = (
      <JsonCrdtNodePreviewById model={model} id={focused} readonly={readonly} onClose={() => setFocused(null)} />
    );
  }

  return (
    <div>
      <div className={css.clickable}>
        <ClickableJsonCrdt
          key={width < 700 ? '10px' : '12px'}
          model={model as any}
          showRoot
          readonly={readonly}
          fontSize={width < 700 ? '10px' : '12px'}
          onFocus={(id) => {
            if (id) setFocused(id);
          }}
        />
      </div>
      {preview}
    </div>
  );
};
