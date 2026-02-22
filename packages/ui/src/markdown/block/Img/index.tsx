import * as React from 'react';
import {rule} from 'nano-theme';

const blockClass = rule({
  w: '100%',
  ta: 'center',
  d: 'block',
  pad: '2em 0',
});

const imgClass = rule({
  maxW: '100%',
});

export interface Props {
  src: string;
  title?: string;
  alt?: string;
}

const Img: React.FC<Props> = ({src, title, alt}) => {
  // const img = <img className={imgClass} src={src} title={title} alt={alt} />;

  return (
    <span className={blockClass}>
      <img className={imgClass} src={src} title={title} alt={alt} />
    </span>
  );
};

export default Img;
