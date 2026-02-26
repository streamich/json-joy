import * as React from 'react';

export type AnnotationSkip = number;

export type AnnotationMark = [length: number, annotation: (text: string) => React.ReactNode];

export type Annotation = AnnotationSkip | AnnotationMark;
