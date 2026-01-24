import * as React from 'react';

export interface ContentSizeValue {
  width: number;
  height: number;
  paddingLeft: number;
}

export const DEFAULT: ContentSizeValue = {
  width: typeof window === 'object' ? window.innerWidth : 0,
  height: typeof window === 'object' ? window.innerHeight : 0,
  paddingLeft: 0,
};

export const context = React.createContext<ContentSizeValue>(DEFAULT);

export const useContentSize = () => React.useContext(context);

export const ContentSize: React.FC<{render: (state: ContentSizeValue) => React.ReactElement}> = ({render}) =>
  render(useContentSize());
