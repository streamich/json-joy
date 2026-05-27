import * as React from 'react';
import {rule} from 'nano-theme';
import {HslColor} from '../../styles/color/HslColor';
import {DisplayTitle} from '../DisplayTitle';
import {BentoCardDisplay, type BentoCardDisplayProps} from './BentoCardDisplay';
import type {ContentFeature} from '../../6-page/FeatureLayout/types';

const bodyCls = rule({
  pad: '0 36px 24px 24px',
});

export interface BentoCardFeatureProps extends BentoCardDisplayProps {
  feature: ContentFeature;
}

/**
 * A {@link BentoCardDisplay} configured from a {@link ContentFeature}.
 */
export const BentoCardFeature: React.FC<BentoCardFeatureProps> = (props) => {
  const {feature, color, left, cta, children, style, ...rest} = props;
  const cardColor = color ?? feature.color ?? HslColor.fromHash(feature.id || feature.name);
  return (
    <BentoCardDisplay
      color={cardColor}
      left={left ?? <DisplayTitle card eyebrow={feature.eyebrow} title={feature.name} color={cardColor} />}
      cta={
        feature.to
          ? {
              label: 'Explore ' + feature.name,
              to: feature.to,
            }
          : undefined
      }
      style={{background: '#fff', ...style}}
      {...rest}
    >
      {children ?? (
        <div className={bodyCls}>
          <DisplayTitle card subtitle={feature.subtitle || feature.smallSubtitle} />
        </div>
      )}
    </BentoCardDisplay>
  );
};

export default BentoCardFeature;
