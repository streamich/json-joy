import * as React from 'react';
import {SpinnerBars} from 'nice-ui/lib/2-inline-block/SpinnerBars';
import type {DemoProps} from './types';

const DisplayTodos = React.lazy(() => import('./DisplayTodos'));
const DisplayBlogPost = React.lazy(() => import('./DisplayBlogPost'));
const DisplayText = React.lazy(() => import('./DisplayText'));
const DisplayCodeMirror = React.lazy(() => import('./DisplayCodeMirror'));
const DisplayMonaco = React.lazy(() => import('./DisplayMonaco'));
const DisplayQuill = React.lazy(() => import('./DisplayQuill'));

export type DemoComp = 'todo' | 'blogpost' | 'text' | 'codemirror' | 'monaco' | 'quill';

export interface DemoDisplayProps extends DemoProps {
  comp: DemoComp;
}

export const DemoDisplay: React.FC<DemoDisplayProps> = (props) => {
  const {model, comp} = props;
  const [cnt, setCnt] = React.useState(0);
  // biome-ignore lint: manual dependency list
  React.useEffect(() => {
    setCnt((prev) => prev + 1);
  }, [model]);

  if (!model || !comp) return null;

  let element: React.ReactNode = null;

  if (comp === 'todo') element = <DisplayTodos {...props} />;
  else if (comp === 'blogpost') element = <DisplayBlogPost {...props} />;
  else if (comp === 'text') element = <DisplayText {...props} />;
  else if (comp === 'monaco') element = <DisplayMonaco {...props} />;
  else if (comp === 'codemirror') element = <DisplayCodeMirror {...props} />;
  else if (comp === 'quill') element = <DisplayQuill {...props} />;

  if (!element) return null;

  return (
    <React.Suspense
      key={cnt}
      fallback={
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          <SpinnerBars />
        </div>
      }
    >
      {element}
    </React.Suspense>
  );
};
