import {ZINDEX} from 'nano-theme';
import {type RefObject, useLayoutEffect, useRef, useState} from 'react';
import {type ModalLayer, modalStack} from './ModalStack';

export interface ModalLayerOpts {
  onEsc: () => void;
  closeOnEsc: boolean;
  lockScroll: boolean;
  /** Make the background inert while the modal is open. */
  inert: boolean;
  /** The modal's overlay element, excluded from the background inert pass. */
  rootRef: RefObject<HTMLElement | null>;
}

/** z-index increment per stacked modal, so later modals sit above earlier ones. */
const Z_STEP = 10;

/**
 * Registers the modal in the global {@link modalStack} for the lifetime of the
 * component and returns the z-index for its layer.
 */
export const useModalLayer = (opts: ModalLayerOpts): number => {
  const optsRef = useRef(opts);
  optsRef.current = opts;
  const [zIndex, setZIndex] = useState(ZINDEX.MODAL);
  const layerRef = useRef<ModalLayer | null>(null);
  if (!layerRef.current) {
    layerRef.current = {
      lockScroll: opts.lockScroll,
      inert: opts.inert,
      root: null,
      handleEsc: () => {
        if (!optsRef.current.closeOnEsc) return false;
        optsRef.current.onEsc();
        return true;
      },
    };
  }
  useLayoutEffect(() => {
    const layer = layerRef.current!;
    layer.root = optsRef.current.rootRef.current;
    const depth = modalStack.push(layer);
    setZIndex(ZINDEX.MODAL + depth * Z_STEP);
    return () => modalStack.remove(layer);
  }, []);
  return zIndex;
};
