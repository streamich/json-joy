import * as React from 'react';
import {Backdrop} from '../Backdrop';
import type {Annotation} from './types';

const h = React.createElement;

export interface AnnotatedInputProps {
  value: string;
  annotations?: Annotation[];
  attr?: React.AllHTMLAttributes<HTMLDivElement>;
  inputRef?: React.RefObject<HTMLInputElement | HTMLTextAreaElement>;
}

export const AnnotatedInput: React.FC<AnnotatedInputProps> = (props) => {
  const {value, annotations = [], attr, inputRef} = props;
  const annotationNodes: React.ReactNode[] = [];

  let pos = 0;
  for (const annotation of annotations) {
    if (typeof annotation === 'number') {
      const text = value.slice(pos, annotation);
      pos += annotation;
      annotationNodes.push(<span>{text}</span>);
    } else {
      const [length, render] = annotation;
      const text = value.slice(pos, pos + length);
      pos += length;
      annotationNodes.push(render(text));
    }
  }

  const backdrop = h('span', {}, ...annotationNodes);

  return <Backdrop value={value} backdrop={backdrop} attr={attr} inputRef={inputRef} />;
};
