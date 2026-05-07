import * as React from 'react';
import {rsync} from '@jsonjoy.com/ui';
import {Transforms, type Editor} from 'slate';
import {ReactEditor} from 'slate-react';
import type {CodeBlockElement as CodeBlockElementType} from '../../../types';
import * as settings from './settings';

const getElementSignature = (element: CodeBlockElementType): string =>
  JSON.stringify([
    element.language ?? '',
    element.fileName ?? '',
    element.wrap ?? null,
    element.showLineNumbers ?? null,
  ]);

const CodeBlockOptionsStateContext = React.createContext<CodeBlockOptionsState | null>(null);

export class CodeBlockOptionsState {
  public readonly fileName = rsync.val('');
  public readonly language = rsync.val('');
  public readonly wrapColumn = rsync.val(0);
  public readonly showLineNumbers = rsync.val(true);

  private element: CodeBlockElementType;
  private signature = '';
  private closePopup?: () => void;

  constructor(
    private readonly editor: Editor,
    element: CodeBlockElementType,
    closePopup?: () => void,
  ) {
    this.element = element;
    this.closePopup = closePopup;
    this.syncFromElement(element);
  }

  public readonly setElement = (element: CodeBlockElementType): void => {
    const signature = getElementSignature(element);
    this.element = element;
    if (signature === this.signature) return;
    this.syncFromElement(element, signature);
  };

  public readonly setClosePopup = (closePopup?: () => void): void => {
    this.closePopup = closePopup;
  };

  public readonly setFileName = (value: string): void => {
    this.fileName.set(value);
  };

  public readonly setLanguage = (value: string): void => {
    this.language.set(value);
  };

  public readonly setWrapColumn = (value: number): void => {
    this.wrapColumn.set(settings.getCodeBlockWrapColumn(value));
  };

  public readonly toggleShowLineNumbers = (): void => {
    this.showLineNumbers.set(!this.showLineNumbers.value);
  };

  public readonly inferLanguageFromFileName = (): void => {
    if (this.language.value.trim() !== '') return;
    const extension = this.fileName.value.split('.').pop()?.trim() || '';
    if (extension && extension !== this.language.value.trim()) this.language.set(extension);
  };

  public readonly cancel = (): void => {
    this.syncFromElement(this.element);
    this.closePopup?.();
  };

  public readonly apply = (): void => {
    const nextLanguage = this.language.value.trim();
    const nextFileName = this.fileName.value.trim();
    const nextWrapColumn = settings.getStoredCodeBlockWrapColumn(this.wrapColumn.value);
    const nextShowLineNumbers = settings.getStoredCodeBlockShowLineNumbers(this.showLineNumbers.value);

    this.applyMetaValue('language', nextLanguage, this.element.language);
    this.applyMetaValue('fileName', nextFileName, this.element.fileName);
    this.applyNumberMetaValue('wrap', nextWrapColumn, this.element.wrap);
    this.applyBooleanMetaValue('showLineNumbers', nextShowLineNumbers, this.element.showLineNumbers);
    this.removeDeprecatedMetaValues();

    this.fileName.set(nextFileName);
    this.language.set(nextLanguage);
    this.wrapColumn.set(settings.getCodeBlockWrapColumn(nextWrapColumn));
    this.showLineNumbers.set(settings.getCodeBlockShowLineNumbers(nextShowLineNumbers));

    this.closePopup?.();
  };

  public readonly dispose = (): void => {};

  private readonly syncFromElement = (
    element: CodeBlockElementType,
    signature = getElementSignature(element),
  ): void => {
    this.signature = signature;
    this.fileName.set(element.fileName ?? '');
    this.language.set(element.language ?? '');
    this.wrapColumn.set(settings.getCodeBlockWrapColumn(element.wrap));
    this.showLineNumbers.set(settings.getCodeBlockShowLineNumbers(element.showLineNumbers));
  };

  private readonly applyMetaValue = (field: 'language' | 'fileName', value: string, currentValue?: string): void => {
    const nextValue = value.trim();
    const prevValue = currentValue?.trim() ?? '';
    if (nextValue === prevValue) return;

    const path = ReactEditor.findPath(this.editor, this.element);
    if (nextValue) {
      Transforms.setNodes(this.editor, {[field]: nextValue} as Partial<CodeBlockElementType>, {at: path});
    } else {
      Transforms.unsetNodes(this.editor, field, {at: path});
    }
  };

  private readonly applyNumberMetaValue = (field: 'wrap', value: number | undefined, currentValue?: number): void => {
    if (value === currentValue) return;
    const path = ReactEditor.findPath(this.editor, this.element);
    if (value !== undefined) {
      Transforms.setNodes(this.editor, {[field]: value} as Partial<CodeBlockElementType>, {at: path});
    } else {
      Transforms.unsetNodes(this.editor, field, {at: path});
    }
  };

  private readonly applyBooleanMetaValue = (
    field: 'showLineNumbers',
    value: boolean | undefined,
    currentValue?: boolean,
  ): void => {
    if (value === currentValue) return;
    const path = ReactEditor.findPath(this.editor, this.element);
    if (value !== undefined) {
      Transforms.setNodes(this.editor, {[field]: value} as Partial<CodeBlockElementType>, {at: path});
    } else {
      Transforms.unsetNodes(this.editor, field, {at: path});
    }
  };

  private readonly removeDeprecatedMetaValues = (): void => {
    const legacyElement = this.element as CodeBlockElementType & {scrollAfterLines?: number; previewLines?: number};
    if (legacyElement.scrollAfterLines === undefined && legacyElement.previewLines === undefined) return;
    const path = ReactEditor.findPath(this.editor, this.element);
    Transforms.unsetNodes(this.editor, ['scrollAfterLines', 'previewLines'], {at: path});
  };
}

export interface CodeBlockOptionsStateProviderProps {
  editor: Editor;
  element: CodeBlockElementType;
  closePopup?: () => void;
  children: React.ReactNode;
}

export const CodeBlockOptionsStateProvider: React.FC<CodeBlockOptionsStateProviderProps> = ({
  editor,
  element,
  closePopup,
  children,
}) => {
  const stateRef = React.useRef<CodeBlockOptionsState | null>(null);
  if (!stateRef.current) stateRef.current = new CodeBlockOptionsState(editor, element, closePopup);
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

  return React.createElement(CodeBlockOptionsStateContext.Provider, {value: state}, children);
};

export const useCodeBlockOptionsState = (): CodeBlockOptionsState => {
  const state = React.useContext(CodeBlockOptionsStateContext);
  if (!state) throw new Error('CodeBlockOptionsStateContext is not available.');
  return state;
};
