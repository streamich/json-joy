import * as React from 'react';
import type {Density, Orientation, Surface} from './types';

export interface CardCtxValue {
  density: Density;
  orientation: Orientation;
  surface: Surface;
}

export const defaultCardCtx: CardCtxValue = {
  density: 'comfortable',
  orientation: 'vertical',
  surface: 'paper',
};

export const CardCtx = React.createContext<CardCtxValue>(defaultCardCtx);

/** Read the enclosing card's frame settings. Safe outside a card (falls back to defaults). */
export const useCardCtx = (): CardCtxValue => React.useContext(CardCtx);
