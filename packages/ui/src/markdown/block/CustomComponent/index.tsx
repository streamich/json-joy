import * as React from 'react';
import MarkdownBlock from '../../util/MarkdownBlock';
import {useCustomComponents} from '../../custom-components';

export interface CustomComponentProps {
  idx: number;
  name: string;
  meta?: string;
  data?: object;
}

const CustomComponent: React.FC<CustomComponentProps> = ({idx, name, data}) => {
  const custom = useCustomComponents();

  if (!custom) return null;
  const component = custom[name];
  if (typeof component !== 'function') return null;

  return <MarkdownBlock idx={idx}>{component(data ?? {})}</MarkdownBlock>;
};

export default CustomComponent;
