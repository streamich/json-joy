import * as React from 'react';
import {rule} from 'nano-theme';
import type {ColorScales, ColorHue} from '../../../../../styles/color/types';
import {Color} from '../../../../../styles/color/Color';
import {ColorLine} from '../ColorLine';
import {Text} from '../../../../../1-inline/Text';

const blockClass = rule({
  pdb: '32px',
});

const gridClass = rule({
  d: 'flex',
  fld: 'column',
  rowGap: '8px',
  jc: 'center',
});

export interface ColorHueGridProps {
  name: string;
  hues: ColorHue[];
  scales: ColorScales;
}

export const ColorHueGrid: React.FC<ColorHueGridProps> = ({name, hues, scales}) => {
  return (
    <div className={blockClass}>
      <Text as={'h3'}>{name}</Text>
      <div className={gridClass}>
        {hues.map((hue, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: index is positionally stable
          <ColorLine key={i} scales={scales} color={new Color(hue[0], hue[1], 50)} />
        ))}
      </div>
    </div>
  );
};
