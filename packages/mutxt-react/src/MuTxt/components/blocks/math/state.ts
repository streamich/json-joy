import * as React from 'react';
import {rsync} from '@jsonjoy.com/ui';
import {Transforms, type Editor} from 'slate';
import {ReactEditor} from 'slate-react';
import * as settings from './settings';
import type {MathElement as MathElementType, MathSize, MathThing} from '../../../types';
import type {MuTxtState} from '../../../state/MuTxtState';

const getElementSignature = (element: MathElementType, thing: MathThing | undefined): string =>
  JSON.stringify([element.caption ?? '', element.size ?? null, thing?.name ?? '', thing?.label ?? '']);

const MathOptionsStateContext = React.createContext<MathOptionsState | null>(null);

export class MathOptionsState {
  public readonly caption = rsync.val('');
  public readonly size = rsync.val<MathSize>(settings.DEF_SIZE);
  public readonly name = rsync.val('');
  public readonly label = rsync.val('');

  private element: MathElementType;
  private signature = '';
  private closePopup?: () => void;

  constructor(
    private readonly editor: Editor,
    private readonly mutxt: MuTxtState,
    element: MathElementType,
    closePopup?: () => void,
  ) {
    this.element = element;
    this.closePopup = closePopup;
    this.syncFromElement(element);
  }

  public readonly setElement = (element: MathElementType): void => {
    const thing = this.thing();
    const signature = getElementSignature(element, thing);
    this.element = element;
    if (signature === this.signature) return;
    this.syncFromElement(element, signature);
  };

  /** Current `@thing` id of the underlying MathThing, or empty string. */
  public readonly getThingId = (): string => this.element['@thing'] ?? '';

  public readonly setClosePopup = (closePopup?: () => void): void => {
    this.closePopup = closePopup;
  };

  public readonly setCaption = (value: string): void => {
    this.caption.set(value);
  };

  public readonly setSize = (value: MathSize): void => {
    this.size.set(settings.getMathSize(value));
  };

  public readonly setName = (value: string): void => {
    this.name.set(value);
  };

  public readonly setLabel = (value: string): void => {
    this.label.set(value);
  };

  public readonly cancel = (): void => {
    this.syncFromElement(this.element);
    this.closePopup?.();
  };

  public readonly apply = (): void => {
    const nextCaption = this.caption.value.trim();
    const nextSize = settings.getStoredMathSize(this.size.value);
    const nextName = this.name.value.trim();
    const nextLabel = this.label.value.trim();

    // Element-side writes.
    this.applyString('caption', nextCaption, this.element.caption);
    this.applyValue('size', nextSize, this.element.size);

    // Thing-side writes.
    const thing = this.thing();
    if (thing) {
      const id = this.element['@thing'];
      const patch: Partial<MathThing> = {};
      if ((thing.name ?? '') !== nextName) patch.name = nextName || undefined;
      if ((thing.label ?? '') !== nextLabel) patch.label = nextLabel || undefined;
      if (Object.keys(patch).length > 0) {
        this.mutxt.things.update(id, patch as any);
        this.mutxt.sync(false);
      }
    }

    this.caption.set(nextCaption);
    this.name.set(nextName);
    this.label.set(nextLabel);
    this.closePopup?.();
  };

  public readonly dispose = (): void => {};

  private readonly thing = (): MathThing | undefined => {
    const id = this.element['@thing'];
    if (!id) return undefined;
    return this.mutxt.things.get(id) as MathThing | undefined;
  };

  private readonly syncFromElement = (element: MathElementType, signature?: string): void => {
    const thing = this.thing();
    this.signature = signature ?? getElementSignature(element, thing);
    this.caption.set(element.caption ?? '');
    this.size.set(settings.getMathSize(element.size));
    this.name.set(thing?.name ?? '');
    this.label.set(thing?.label ?? '');
  };

  private readonly applyString = (field: 'caption', value: string, currentValue?: string): void => {
    const prev = (currentValue ?? '').trim();
    if (value === prev) return;
    const path = ReactEditor.findPath(this.editor, this.element);
    if (value) {
      Transforms.setNodes(this.editor, {[field]: value} as Partial<MathElementType>, {at: path});
    } else {
      Transforms.unsetNodes(this.editor, field, {at: path});
    }
  };

  private readonly applyValue = <K extends 'size'>(
    field: K,
    value: MathElementType[K] | undefined,
    currentValue: MathElementType[K] | undefined,
  ): void => {
    if (value === currentValue) return;
    const path = ReactEditor.findPath(this.editor, this.element);
    if (value !== undefined) {
      Transforms.setNodes(this.editor, {[field]: value} as Partial<MathElementType>, {at: path});
    } else {
      Transforms.unsetNodes(this.editor, field, {at: path});
    }
  };
}

export interface MathOptionsStateProviderProps {
  editor: Editor;
  mutxt: MuTxtState;
  element: MathElementType;
  closePopup?: () => void;
  children: React.ReactNode;
}

export const MathOptionsStateProvider: React.FC<MathOptionsStateProviderProps> = ({
  editor,
  mutxt,
  element,
  closePopup,
  children,
}) => {
  const stateRef = React.useRef<MathOptionsState | null>(null);
  if (!stateRef.current) stateRef.current = new MathOptionsState(editor, mutxt, element, closePopup);
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

  return React.createElement(MathOptionsStateContext.Provider, {value: state}, children);
};

export const useMathOptionsState = (): MathOptionsState => {
  const state = React.useContext(MathOptionsStateContext);
  if (!state) throw new Error('MathOptionsStateContext is not available.');
  return state;
};
