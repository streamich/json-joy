import * as React from 'react';
import {rule} from 'nano-theme';
import {Button, type ButtonProps} from './Button';

export type ButtonCta2Props = ButtonProps;

// !important so the hover state beats Button's own outline atomic classes,
// which otherwise tint the background grey on hover.
const ctaClass = rule({
  transition: 'background .2s, color .2s, border-color .2s',
  '&:hover': {
    background: 'white !important',
    borderColor: 'black !important',
  },
  '&:active': {transform: 'scale(.98)'},
});

/**
 * Secondary call-to-action button.
 */
export const ButtonCta2: React.FC<ButtonCta2Props> = ({className, ...props}) => (
  <Button outline size={1} radius={1} className={(className ? className + ' ' : '') + ctaClass} {...props} />
);

export default ButtonCta2;
