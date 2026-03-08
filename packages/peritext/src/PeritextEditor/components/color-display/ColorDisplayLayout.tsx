import * as React from 'react';
import {drule} from 'nano-theme';
import {FixedColumn} from '@jsonjoy.com/ui/lib/3-list-item/FixedColumn';
import {HslColor} from '@jsonjoy.com/ui/lib/styles/color/HslColor';
import {TextCopy} from './TextCopy';
import {RgbDisplay} from './schemas/RgbDisplay';
import {HexDisplay} from './schemas/HexDisplay';
import {HslDisplay} from './schemas/HslDisplay';
import {useStyles} from '@jsonjoy.com/ui/lib/styles/context';
import {useT} from 'use-t';

const colorClass = drule({
  d: 'flex',
  w: '100px',
  bdrad: '8px',
  bd: '1px solid rgba(127,127,127,0.2)',
});

export interface ColorDisplayLayoutProps {
  color: string;
  onPreviewClick?: React.MouseEventHandler;
}

export const ColorDisplayLayout: React.FC<ColorDisplayLayoutProps> = ({color, onPreviewClick}) => {
  const [t] = useT();
  const hsl = React.useMemo(() => HslColor.from(color), [color]);
  const styles = useStyles();

  return (
    <FixedColumn right={100} style={{alignItems: 'stretch'}}>
      <div style={{paddingRight: 16}}>
        {!!hsl && (
          <>
            <TextCopy text={<HexDisplay select hsl={hsl} />} copy={() => hsl.toRgb().hex()} />
            <TextCopy
              text={<RgbDisplay select hsl={hsl} />}
              copy={() => (hsl.a !== 1 ? hsl.toRgb().rgba() : hsl.toRgb().rgb())}
            />
            <TextCopy text={<HslDisplay select hsl={hsl} />} copy={() => hsl.toString()} />
          </>
        )}
      </div>
      <button
        type={'button'}
        onClick={onPreviewClick}
        aria-label={t('Edit color')}
        style={{background: color}}
        className={colorClass({
          '&:hover': {
            bd: `1px solid ${styles.col.get('neutral', 10)}`,
            out: `1px solid ${styles.col.get('neutral', 10)}`,
          },
        })}
      />
    </FixedColumn>
  );
};
