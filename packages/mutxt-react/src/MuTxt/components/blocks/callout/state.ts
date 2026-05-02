import {rsync} from '@jsonjoy.com/ui';
import {Transforms} from 'slate';
import {ReactEditor} from 'slate-react';
import type {MuTxtState} from '../../../state/MuTxtState';
import type {CalloutElement as CalloutElementType} from '../../../types';

export class CalloutOptionsState {
  public readonly icon = rsync.val('');
  public readonly title = rsync.val('');
  public readonly color = rsync.val('');

  constructor(
    public readonly mutxt: MuTxtState,
    public element: CalloutElementType,
    public closePopup?: () => void,
  ) {
    this.closePopup = closePopup;
    this.syncFromElement(element);
  }

  public readonly setElement = (element: CalloutElementType): void => {
    this.element = element;
    this.syncFromElement(element);
  };

  public readonly setClosePopup = (closePopup?: () => void): void => {
    this.closePopup = closePopup;
  };

  public readonly setIcon = (value: string): void => {
    this.icon.set(value);
  };

  public readonly setTitle = (value: string): void => {
    this.title.set(value);
  };

  public readonly setColor = (value: string): void => {
    this.color.set(value);
  };

  public readonly cancel = (): void => {
    this.syncFromElement(this.element);
    this.closePopup?.();
  };

  public readonly apply = (): void => {
    const nextIcon = this.icon.value;
    const nextTitle = this.title.value.trim();
    const nextColor = this.color.value.trim();
    this.applyValue('icon', nextIcon, this.element.icon);
    this.applyValue('title', nextTitle, this.element.title);
    this.applyValue('color', nextColor, this.element.color);
    this.icon.set(nextIcon);
    this.title.set(nextTitle);
    this.color.set(nextColor);
    this.closePopup?.();
  };

  public readonly dispose = (): void => {};

  private readonly syncFromElement = (element: CalloutElementType): void => {
    this.icon.set(element.icon ?? '');
    this.title.set(element.title ?? '');
    this.color.set(element.color ?? '');
  };

  private readonly applyValue = (field: 'icon' | 'title' | 'color', value: string, currentValue?: string): void => {
    const prevValue = (currentValue ?? '').trim();
    const nextValue = field === 'icon' ? value : value.trim();
    if (nextValue === prevValue && (field !== 'icon' || nextValue === (currentValue ?? ''))) return;
    const path = ReactEditor.findPath(this.mutxt.editor, this.element);
    if (nextValue) {
      Transforms.setNodes(this.mutxt.editor, {[field]: nextValue} as Partial<CalloutElementType>, {at: path});
    } else {
      Transforms.unsetNodes(this.mutxt.editor, field, {at: path});
    }
  };
}
