import * as React from 'react';
import useAsync from 'react-use/lib/useAsync';
import loadMathjax from './loadMathjax';

const {useRef, useEffect, memo} = React;

interface Props {
  source: string;
}

const MathjaxDisplayEquation: React.FC<Props> = memo(({source}) => {
  const ref = useRef<HTMLDivElement>(null);
  const {value: MathJax} = useAsync<() => Promise<any>>(loadMathjax);
  useEffect(() => {
    if (!MathJax || !MathJax.tex2svg) return;
    if (!ref.current) return;

    const div = ref.current;
    const container = MathJax.tex2svg(source, {display: true}) as HTMLElement;
    const svg = container.children[0] as SVGElement;

    while (div.firstChild) div.removeChild(div.firstChild);
    ref.current.appendChild(svg);
  }, [MathJax, (MathJax || {}).tex2svg, ref.current, source]);

  return <div ref={ref} style={{textAlign: 'center'}} />;
});

export default MathjaxDisplayEquation;
