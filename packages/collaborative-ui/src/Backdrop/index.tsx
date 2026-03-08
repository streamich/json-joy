import {rule} from 'nano-theme';
import * as React from 'react';

const blockClass = rule({
  pos: 'relative',
  overflowY: 'visible',
  '& input': {
    ff: 'inherit',
    fz: 'inherit',
    fw: 'inherit',
  },
});

const backdropClass = rule({
  col: 'inherit',
  w: '100%',
  bd: 0,
  pad: '1px',
  overflow: 'hidden',
  pos: 'relative',
  bxz: 'border-box',
  ta: 'start',
  whiteSpace: 'pre',
});

const inputClass = rule({
  pos: 'absolute',
  top: 0,
  left: 0,
  w: '100%',
  bd: 0,
  m: 0,
  d: 'block',
  pad: '1px',
  fz: 'inherit',
  ff: 'inherit',
  letterSpacing: 'inherit',
  bxz: 'border-box',
  bgc: 'transparent',
});

export interface BackdropProps {
  backdrop?: React.ReactNode;
  value: string;
  attr?: React.AllHTMLAttributes<HTMLDivElement>;
  inputRef?: React.RefObject<HTMLInputElement | HTMLTextAreaElement>;
  renderInput?: (className: string, props: BackdropProps) => React.ReactNode;
}

export const Backdrop: React.FC<BackdropProps> = (props) => {
  const {value, attr, inputRef, renderInput} = props;
  const backdropInnerRef = React.useRef<HTMLDivElement>(null);
  const internalInputRef = React.useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const resolvedInputRef = (inputRef || internalInputRef) as React.RefObject<HTMLInputElement | HTMLTextAreaElement>;

  React.useEffect(() => {
    const input = resolvedInputRef.current;
    if (!input) return;
    const onScroll = () => {
      if (backdropInnerRef.current) backdropInnerRef.current.style.transform = `translateX(-${input.scrollLeft}px)`;
    };
    input.addEventListener('scroll', onScroll);
    return () => {
      input.removeEventListener('scroll', onScroll);
    };
  }, [resolvedInputRef.current]);

  const backdrop = (
    <div className={backdropClass}>
      <div ref={backdropInnerRef}>{props.backdrop}</div>
    </div>
  );

  const input = renderInput ? (
    renderInput(inputClass, props)
  ) : (
    <input ref={resolvedInputRef as React.RefObject<HTMLInputElement>} className={inputClass} value={value} />
  );

  return (
    <div {...attr} className={(attr?.className || '') + blockClass}>
      {backdrop}
      {input}
    </div>
  );
};
