import * as React from 'react';
import {rule, Provider, GlobalCss} from 'nano-theme';
import {Model} from '../../../json-crdt';
import {Peritext} from '../../../json-crdt-extensions/peritext';
import {PeritextView} from '../../../json-crdt-peritext-ui';

const blockClass = rule({
  display: 'flex',
  bxz: 'border-box',
  w: '100vw',
  h: '100vh',
});

const panelClass = rule({
  w: '50%',
  h: '100%',
});

const panelDebugClass = rule({
  bg: '#fafafa',
  fz: '8px',
  pad: '8px 16px',
  bxz: 'border-box',
});

export const App: React.FC = ({}) => {
  const [tick, setTick] = React.useState(0);
  const [debug, setDebug] = React.useState(true);
  const [{model, peritext}] = React.useState(() => {
    const model = Model.withLogicalClock();
    model.api.root({
      text: '',
      slices: [],
    });
    const peritext = new Peritext(model, model.api.str(['text']).node, model.api.arr(['slices']).node);
    peritext.editor.insert('Hello world!');
    peritext.refresh();
    return {model, peritext};
  });
  const handleRender = React.useCallback(() => {
    setTick((tick) => tick + 1);
  }, []);

  return (
    <Provider theme={'light'}>
      <GlobalCss />
      <div className={blockClass}>
        <div className={panelClass}>
          <div style={{padding: '16px 16px 0'}}>
            <button onClick={() => setDebug((x) => !x)}>Toggle debug mode</button>
          </div>
          <PeritextView debug={debug} peritext={peritext} onRender={handleRender} />
        </div>
        {debug && (
          <div className={panelClass + panelDebugClass}>
            <pre>{peritext + ''}</pre>
          </div>
        )}
      </div>
    </Provider>
  );
};
