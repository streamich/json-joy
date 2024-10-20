import * as React from 'react';
import {rule, Provider, GlobalCss} from 'nano-theme';
import {ModelWithExt, ext} from '../../../json-crdt-extensions';
import {PeritextView} from '../../react/index';

const blockClass = rule({
  display: 'flex',
  bxz: 'border-box',
  w: '100vw',
  h: '100vh',
  // fontSize: '32px',
  fontSize: '18px',
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
  const [[model, peritext]] = React.useState(() => {
    const model = ModelWithExt.create(ext.peritext.new('Hello world!'));
    const peritext = model.s.toExt().txt;
    peritext.refresh();
    return [model, peritext] as const;
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
          <PeritextView peritext={peritext} onRender={handleRender} />
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
