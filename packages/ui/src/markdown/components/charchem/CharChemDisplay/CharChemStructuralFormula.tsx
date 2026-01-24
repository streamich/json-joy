import * as React from 'react';
import {rule, type CssLikeObject} from 'nano-theme';

const {useRef, useEffect} = React;

const css: CssLikeObject = {
  ff: 'Arial, Helvetica, Linux Libertine, Times, Times New Roman, sans-serif',
  fz: '24px',
  ta: 'center',
  canvas: {
    verticalAlign: 'bottom',
  },
};

const bigClass = rule(css);
const smallClass = rule({
  ...css,
  fz: '18px',
});

export interface Props {
  source: string;
}

const CharChemStructuralFormula: React.FC<Props> = ({source}) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const div = ref.current!;
    if (!ref.current) return;

    const ChemSys = (window as any).ChemSys;
    if (!ChemSys) {
      // tslint:disable-next-line
      console.error('ChemSys not loaded.');
      return;
    }

    ChemSys.draw(div, ChemSys.compile(source));

    const canvas = div.querySelectorAll('canvas');
    if (!canvas.length) div.innerHTML = source;

    return () => {
      while (div.firstChild) div.removeChild(div.firstChild);
    };
  }, [ref.current, source]);

  const isBig = source.length > 130;
  return <div ref={ref} className={isBig ? smallClass : bigClass} />;
};

export default CharChemStructuralFormula;
