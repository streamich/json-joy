import * as React from 'react';
import {RendererMap} from "../../react/types";
import {CaretView} from './CaretView';
import {FocusView} from './FocusView';

const h = React.createElement;

export const renderers: RendererMap = {
  caret: (children, props) => h(CaretView, <any>props, children),
  focus: (children, props) => h(FocusView, <any>props, children),
};
