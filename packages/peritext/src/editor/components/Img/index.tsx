import {createElement, useState} from 'react';

export interface ImgProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  renderError?: (error: Error | unknown, props: ImgProps) => React.ReactNode;
}

export const Img: React.FC<ImgProps> = (props) => {
  const {renderError, onError, ...rest} = props;
  const [error, setError] = useState<unknown | undefined>(void 0);

  if (error && renderError) return renderError(error, props);

  return createElement('img', {
    ...rest,
    onError: (e: unknown) => {
      setError(e);
      onError?.(e as any);
    },
  });
};
