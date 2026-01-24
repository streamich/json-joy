import * as React from 'react';
import useAsync from 'react-use/lib/useAsync';
import loadKatex from '../loadKatex';

const {useRef, useEffect} = React;

export interface KatexDisplayProps {
  source: string;
}

const KatexInline: React.FC<KatexDisplayProps> = ({source}) => {
  const ref = useRef<HTMLDivElement>(null);
  const {value: katex} = useAsync<any>(loadKatex);

  useEffect(() => {
    if (!katex) return;

    const div = ref.current;
    if (!div) return;

    // First render in display mode, if throws, try rendering in inline mode.
    div.innerHTML = '';
    (katex as any).render(source, ref.current, {
      displayMode: false,
      throwOnError: false,
    });

    return () => {
      while (div.firstChild) div.removeChild(div.firstChild);
    };
  }, [katex, ref.current, source]);

  return <span ref={ref} />;
};

export default KatexInline;
