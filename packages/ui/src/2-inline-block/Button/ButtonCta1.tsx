import * as React from 'react';
import {drule} from 'nano-theme';
import {HslColor} from '../../styles/color/HslColor';
import {Button, type ButtonProps} from './Button';

export type ButtonCta1Props = ButtonProps;

const ctaClass = drule({
  transition: 'background .2s, color .2s, border-color .2s',
  '&:active': {transform: 'scale(.98)'},
});

/**
 * Primary call-to-action button.
 */
export const ButtonCta1: React.FC<ButtonCta1Props> = ({color, className, ...props}) => {
  const fill = typeof color === 'string' && color[0] !== '#' ? (HslColor.from(color)?.toRgb().hex() ?? color) : color;
  if (!fill) return <Button size={1} radius={1} invert className={className} {...props} />;

  // !important so the hover state beats Button's own atomic classes and the
  // inline transparent border.
  const cls = ctaClass({
    '&:hover': {
      background: 'white !important',
      color: `${fill} !important`,
      borderColor: `${fill} !important`,
    },
  });

  return (
    <Button
      size={1}
      radius={1}
      primary
      color={fill}
      hoverOutline={props.spacious ? fill : void 0}
      className={(className ? className + ' ' : '') + cls}
      {...props}
    />
  );
};

export default ButtonCta1;
