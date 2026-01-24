import * as React from 'react';
import useAsync from 'react-use/lib/useAsync';
import loadKatex from '../loadKatex';

const {useRef, useEffect} = React;

interface KatexDisplayProps {
  source: string;
}

const KatexDisplay: React.FC<KatexDisplayProps> = ({source}) => {
  const ref = useRef<HTMLDivElement>(null);
  const {value: katex} = useAsync<() => Promise<any>>(loadKatex);
  useEffect(() => {
    if (!katex) return;

    const div = ref.current;
    if (!div) return;

    // First render in display mode, if throws, try rendering in inline mode.
    try {
      katex.render(source, ref.current, {
        displayMode: true,
        throwOnError: true,
      });
    } catch (_error) {
      katex.render(source, ref.current, {
        displayMode: false,
        throwOnError: false,
      });
    }

    return () => {
      while (div.firstChild) div.removeChild(div.firstChild);
    };
  }, [katex, ref.current, source]);

  return <div ref={ref} style={{textAlign: 'center'}} />;
};

export default KatexDisplay;
