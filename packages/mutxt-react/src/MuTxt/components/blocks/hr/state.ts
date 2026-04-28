import * as React from 'react';
import {rsync} from '@jsonjoy.com/ui';
import {Transforms, type Editor} from 'slate';
import {ReactEditor} from 'slate-react';
import * as settings from './settings';
import type {HrElement as HrElementType, HrLineStyle} from '../../../types';

const getElementSignature = (element: HrElementType): string =>
  JSON.stringify([
    element.strokeWidth ?? null,
    element.lineWidth ?? null,
    element.lineStyle ?? null,
    element.blockHeight ?? null,
    element.caption ?? '',
  ]);

const HrOptionsStateContext = React.createContext<HrOptionsState | null>(null);

export class HrOptionsState {
  public readonly strokeWidth = rsync.val(settings.DEFAULT_HR_STROKE_WIDTH);
  public readonly lineWidth = rsync.val(settings.DEFAULT_HR_LINE_WIDTH);
  public readonly lineStyle = rsync.val<HrLineStyle>(settings.DEFAULT_HR_LINE_STYLE);
  public readonly blockHeight = rsync.val(settings.DEFAULT_HR_BLOCK_HEIGHT);
  public readonly caption = rsync.val('');

  private element: HrElementType;
  private signature = '';
  private closePopup?: () => void;

  constructor(
    private readonly editor: Editor,
    element: HrElementType,
    closePopup?: () => void,
  ) {
    this.element = element;
    this.closePopup = closePopup;
    this.syncFromElement(element);
  }

  public readonly setElement = (element: HrElementType): void => {
    const signature = getElementSignature(element);
    this.element = element;
    if (signature === this.signature) return;
    this.syncFromElement(element, signature);
  };

  public readonly setClosePopup = (closePopup?: () => void): void => {
    this.closePopup = closePopup;
  };

  public readonly setStrokeWidth = (value: number): void => {
    this.strokeWidth.set(settings.getHrStrokeWidth(value));
  };

  public readonly setLineWidth = (value: number): void => {
    this.lineWidth.set(settings.getHrLineWidth(value));
  };

  public readonly setLineStyle = (value: HrLineStyle): void => {
    this.lineStyle.set(settings.getHrLineStyle(value));
  };

  public readonly setBlockHeight = (value: number): void => {
    this.blockHeight.set(settings.getHrBlockHeight(value));
  };

  public readonly setCaption = (value: string): void => {
    this.caption.set(value);
  };

  public readonly cancel = (): void => {
    this.syncFromElement(this.element);
    this.closePopup?.();
  };

  public readonly apply = (): void => {
    const nextStrokeWidth = settings.getStoredHrStrokeWidth(this.strokeWidth.value);
    const nextLineWidth = settings.getStoredHrLineWidth(this.lineWidth.value);
    const nextLineStyle = settings.getStoredHrLineStyle(this.lineStyle.value);
    const nextBlockHeight = settings.getStoredHrBlockHeight(this.blockHeight.value);
    const nextCaption = this.caption.value.trim();

    this.applyNumber('strokeWidth', nextStrokeWidth, this.element.strokeWidth);
    this.applyNumber('lineWidth', nextLineWidth, this.element.lineWidth);
    this.applyEnum('lineStyle', nextLineStyle, this.element.lineStyle);
    this.applyNumber('blockHeight', nextBlockHeight, this.element.blockHeight);
    this.applyString('caption', nextCaption, this.element.caption);

    this.caption.set(nextCaption);
    this.closePopup?.();
  };

  public readonly dispose = (): void => {};

  private readonly syncFromElement = (
    element: HrElementType,
    signature = getElementSignature(element),
  ): void => {
    this.signature = signature;
    this.strokeWidth.set(settings.getHrStrokeWidth(element.strokeWidth));
    this.lineWidth.set(settings.getHrLineWidth(element.lineWidth));
    this.lineStyle.set(settings.getHrLineStyle(element.lineStyle));
    this.blockHeight.set(settings.getHrBlockHeight(element.blockHeight));
    this.caption.set(element.caption ?? '');
  };

  private readonly applyNumber = (
    field: 'strokeWidth' | 'lineWidth' | 'blockHeight',
    value: number | undefined,
    currentValue?: number,
  ): void => {
    if (value === currentValue) return;
    const path = ReactEditor.findPath(this.editor, this.element);
    if (value !== undefined) {
      Transforms.setNodes(this.editor, {[field]: value} as Partial<HrElementType>, {at: path});
    } else {
      Transforms.unsetNodes(this.editor, field, {at: path});
    }
  };

  private readonly applyEnum = (
    field: 'lineStyle',
    value: HrLineStyle | undefined,
    currentValue?: HrLineStyle,
  ): void => {
    if (value === currentValue) return;
    const path = ReactEditor.findPath(this.editor, this.element);
    if (value !== undefined) {
      Transforms.setNodes(this.editor, {[field]: value} as Partial<HrElementType>, {at: path});
    } else {
      Transforms.unsetNodes(this.editor, field, {at: path});
    }
  };

  private readonly applyString = (
    field: 'caption',
    value: string,
    currentValue?: string,
  ): void => {
    const prev = (currentValue ?? '').trim();
    if (value === prev) return;
    const path = ReactEditor.findPath(this.editor, this.element);
    if (value) {
      Transforms.setNodes(this.editor, {[field]: value} as Partial<HrElementType>, {at: path});
    } else {
      Transforms.unsetNodes(this.editor, field, {at: path});
    }
  };
}

export interface HrOptionsStateProviderProps {
  editor: Editor;
  element: HrElementType;
  closePopup?: () => void;
  children: React.ReactNode;
}

export const HrOptionsStateProvider: React.FC<HrOptionsStateProviderProps> = ({
  editor,
  element,
  closePopup,
  children,
}) => {
  const stateRef = React.useRef<HrOptionsState | null>(null);
  if (!stateRef.current) stateRef.current = new HrOptionsState(editor, element, closePopup);
  const state = stateRef.current;

  React.useEffect(() => {
    state.setClosePopup(closePopup);
  }, [closePopup, state]);

  React.useEffect(() => {
    state.setElement(element);
  }, [element, state]);

  React.useEffect(() => {
    return () => state.dispose();
  }, [state]);

  return React.createElement(HrOptionsStateContext.Provider, {value: state}, children);
};

export const useHrOptionsState = (): HrOptionsState => {
  const state = React.useContext(HrOptionsStateContext);
  if (!state) throw new Error('HrOptionsStateContext is not available.');
  return state;
};
