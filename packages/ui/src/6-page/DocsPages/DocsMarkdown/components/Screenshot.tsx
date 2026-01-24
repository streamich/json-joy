import {rule, theme} from 'nano-theme';
import * as React from 'react';
import {CDN} from '../../../../misc/conf';
import {NiceUiSizes} from '../../../../constants';
import {Separator} from '../../../../3-list-item/Separator';

const wrapClass = rule({
  d: 'flex',
  justifyContent: 'center',
});

const blockClass = rule({
  d: 'inline-block',
  mar: '0 auto',
  bxz: 'border-box',
  maxW: NiceUiSizes.BlogContentMaxWidth + 'px',
  bd: `1px solid ${theme.g(0.92)}`,
  // bg: theme.blueColor(0.01),
  bdrad: '4px',
  pad: '4px',
  img: {
    d: 'block',
    maxW: '100%',
    bdrad: '3px',
  },
});

const captionClass = rule({
  ...theme.font.ui1.mid,
  textAlign: 'center',
  col: theme.g(0.5),
  fz: '14px',
  pad: '16px',
});

export interface Props {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  caption?: string;
  retinaFactor?: number;
  noPadding?: boolean;
}

const Screenshot: React.FC<Props> = (props) => {
  const {src, alt, width, height, caption, retinaFactor = 1, noPadding} = props;
  const [maxWidth, setMaxWidth] = React.useState<undefined | number>(undefined);

  const url = src.indexOf('/docs') === 0 ? CDN + '/ff' + src : src;

  const handleLoad = (e: React.SyntheticEvent) => {
    if (retinaFactor > 1) {
      const img = e.target as HTMLImageElement;
      setMaxWidth(img.naturalWidth / retinaFactor);
    }
  };

  return (
    <div className={wrapClass}>
      <figure className={'jj-screenshot' + blockClass} style={{padding: noPadding ? 0 : undefined, maxWidth}}>
        <img
          src={url}
          alt={alt || caption || 'screenshot'}
          style={{maxWidth: '100%', width: width || undefined, height: height || undefined}}
          onLoad={handleLoad}
        />
        {!!caption && (
          <>
            <Separator />
            <figcaption className={captionClass}>{caption}</figcaption>
          </>
        )}
      </figure>
    </div>
  );
};

export default Screenshot;
