import * as React from 'react';
import {RendererMap} from "../../react/types";
import {CaretView} from './CaretView';
import {FocusView} from './FocusView';
import {RenderAnchor} from './RenderAnchor';

const h = React.createElement;

export const renderers: RendererMap = {
  caret: (props, children) => h(CaretView, <any>props, children),
  focus: (props, children) => h(FocusView, <any>props, children),
  anchor: (props) => h(RenderAnchor, <any>props),
};
