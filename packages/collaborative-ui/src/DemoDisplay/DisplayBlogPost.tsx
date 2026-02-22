import * as React from 'react';
import {Blogpost} from '../examples/Blogpost';
import type {DemoProps} from './types';

export interface DisplayBlogPostProps extends DemoProps {}

const DisplayBlogPost: React.FC<DisplayBlogPostProps> = ({model, path = []}) => {
  return <Blogpost model={model} />;
};

export default DisplayBlogPost;
