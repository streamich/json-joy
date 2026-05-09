import * as React from 'react';
import {rsync} from '@jsonjoy.com/ui';
import {Transforms, type Editor} from 'slate';
import {ReactEditor} from 'slate-react';
import * as settings from './settings';
import type {TocElement as TocElementType} from '../../../types';

const getElementSignature = (element: TocElementType): string =>
  JSON.stringify([
    element.caption ?? '',
    element.maxLevel ?? null,
    element.includeTitle ?? null,
    element.numbered ?? null,
  ]);

const TocOptionsStateContext = React.createContext<TocOptionsState | null>(null);

export class TocOptionsState {
  public readonly caption = rsync.val('');
  public readonly maxLevel = rsync.val<settings.TocMaxLevel>(settings.DEF_MAX_LEVEL);
  public readonly includeTitle = rsync.val(settings.DEF_INCLUDE_TITLE);
  public readonly numbered = rsync.val(settings.DEF_NUMBERED);

  private element: TocElementType;
  private signature = '';
  private closePopup?: () => void;

  constructor(
    private readonly editor: Editor,
    element: TocElementType,
    closePopup?: () => void,
  ) {
    this.element = element;
    this.closePopup = closePopup;
    this.syncFromElement(element);
  }

  public readonly setElement = (element: TocElementType): void => {
    const signature = getElementSignature(element);
    this.element = element;
    if (signature === this.signature) return;
    this.syncFromElement(element, signature);
  };

  public readonly setClosePopup = (closePopup?: () => void): void => {
    this.closePopup = closePopup;
  };

  public readonly setCaption = (value: string): void => {
    this.caption.set(value);
  };

  public readonly setMaxLevel = (value: number): void => {
    this.maxLevel.set(settings.getTocMaxLevel(value));
  };

  public readonly setIncludeTitle = (value: boolean): void => {
    this.includeTitle.set(!!value);
  };

  public readonly setNumbered = (value: boolean): void => {
    this.numbered.set(!!value);
  };

  public readonly cancel = (): void => {
    this.syncFromElement(this.element);
    this.closePopup?.();
  };

  public readonly apply = (): void => {
    const nextCaption = this.caption.value.trim();
    const nextMaxLevel = settings.getStoredTocMaxLevel(this.maxLevel.value);
    const nextIncludeTitle = settings.getStoredTocIncludeTitle(this.includeTitle.value);
    const nextNumbered = settings.getStoredTocNumbered(this.numbered.value);

    this.applyString('caption', nextCaption, this.element.caption);
    this.applyValue('maxLevel', nextMaxLevel, this.element.maxLevel);
    this.applyValue('includeTitle', nextIncludeTitle, this.element.includeTitle);
    this.applyValue('numbered', nextNumbered, this.element.numbered);

    this.caption.set(nextCaption);
    this.closePopup?.();
  };

  public readonly dispose = (): void => {};

  private readonly syncFromElement = (element: TocElementType, signature = getElementSignature(element)): void => {
    this.signature = signature;
    this.caption.set(element.caption ?? '');
    this.maxLevel.set(settings.getTocMaxLevel(element.maxLevel));
    this.includeTitle.set(settings.getTocIncludeTitle(element.includeTitle));
    this.numbered.set(settings.getTocNumbered(element.numbered));
  };

  private readonly applyString = (field: 'caption', value: string, currentValue?: string): void => {
    const prev = (currentValue ?? '').trim();
    if (value === prev) return;
    const path = ReactEditor.findPath(this.editor, this.element);
    if (value) {
      Transforms.setNodes(this.editor, {[field]: value} as Partial<TocElementType>, {at: path});
    } else {
      Transforms.unsetNodes(this.editor, field, {at: path});
    }
  };

  private readonly applyValue = <K extends 'maxLevel' | 'includeTitle' | 'numbered'>(
    field: K,
    value: TocElementType[K] | undefined,
    currentValue: TocElementType[K] | undefined,
  ): void => {
    if (value === currentValue) return;
    const path = ReactEditor.findPath(this.editor, this.element);
    if (value !== undefined) {
      Transforms.setNodes(this.editor, {[field]: value} as Partial<TocElementType>, {at: path});
    } else {
      Transforms.unsetNodes(this.editor, field, {at: path});
    }
  };
}

export interface TocOptionsStateProviderProps {
  editor: Editor;
  element: TocElementType;
  closePopup?: () => void;
  children: React.ReactNode;
}

export const TocOptionsStateProvider: React.FC<TocOptionsStateProviderProps> = ({
  editor,
  element,
  closePopup,
  children,
}) => {
  const stateRef = React.useRef<TocOptionsState | null>(null);
  if (!stateRef.current) stateRef.current = new TocOptionsState(editor, element, closePopup);
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

  return React.createElement(TocOptionsStateContext.Provider, {value: state}, children);
};

export const useTocOptionsState = (): TocOptionsState => {
  const state = React.useContext(TocOptionsStateContext);
  if (!state) throw new Error('TocOptionsStateContext is not available.');
  return state;
};
