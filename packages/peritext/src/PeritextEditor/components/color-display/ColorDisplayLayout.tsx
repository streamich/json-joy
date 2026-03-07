import * as React from 'react';
import {rule} from 'nano-theme';
import {FixedColumn} from '@jsonjoy.com/ui/lib/3-list-item/FixedColumn';
import {useT} from 'use-t';
import {HslColor} from '@jsonjoy.com/ui/lib/styles/color/HslColor';
import {TextCopy} from './TextCopy';
import {RgbDisplay} from './schemas/RgbDisplay';
import {HexDisplay} from './schemas/HexDisplay';
import {HslDisplay} from './schemas/HslDisplay';

const colorClass = rule({
  d: 'flex',
  w: '100px',
  // minH: '64px',
  h: '100%',
  bdrad: '8px',
  bd: '1px solid rgba(127,127,127,0.2)',
});

export interface ColorDisplayLayoutProps {
  color: string;
  text?: string;
}

export const ColorDisplayLayout: React.FC<ColorDisplayLayoutProps> = ({color, text}) => {
  const [t] = useT();
  const hsl = React.useMemo(() => HslColor.from(color), [color]);

  return (
    <FixedColumn right={100}>
      <div>
        {!!hsl && (
          <>
            <TextCopy text={<HexDisplay select hsl={hsl} />} copy={() => hsl.toRgb().hex()} />
            <TextCopy text={<RgbDisplay select hsl={hsl} />} copy={() => hsl.a !== 1 ? hsl.toRgb().rgba() : hsl.toRgb().rgb()} />
            <TextCopy text={<HslDisplay select hsl={hsl} />} copy={() => hsl.toString()} />
          </>
        )}
      </div>
      <div className={colorClass} style={{background: color}} />
    </FixedColumn>
  );
};
