import * as React from 'react';
import {Provider, GlobalCss} from 'nano-theme';
import {ModelWithExt, ext} from '../../../json-crdt-extensions';
import {PeritextView} from '../../react';
import {cursorPlugin} from '../../plugins/cursor';
import {renderers} from '../../plugins/default';
import {renderers as debugRenderers} from '../../plugins/debug';

export const App: React.FC = () => {
  const [[model, peritext]] = React.useState(() => {
    const model = ModelWithExt.create(
      ext.peritext.new(
        'The German automotive sector is in the process of cutting thousands of jobs as it grapples with a global shift toward electric vehicles — a transformation Musk himself has been at the forefront of.',
      ),
    );
    const peritext = model.s.toExt().txt;
    peritext.refresh();
    return [model, peritext] as const;
  });

  return (
    <Provider theme={'light'}>
      <GlobalCss />
      <div style={{maxWidth: '690px', fontSize: '21px', lineHeight: '1.7em', margin: '32px auto'}}>
        <PeritextView peritext={peritext} renderers={[cursorPlugin, renderers, debugRenderers({enabled: false})]} />
      </div>
    </Provider>
  );
};
