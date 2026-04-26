import {InlineMenu} from './InlineMenu';
import type {MuTxtState} from '../MuTxtState';
import type {UiLifeCycles} from '@jsonjoy.com/ui';

export class Menu implements UiLifeCycles {
  public readonly inline: InlineMenu;

  constructor(state: MuTxtState) {
    this.inline = new InlineMenu(state);
  }

  public start() {
    const stopInlineMenu = this.inline.start();
    return () => {
      stopInlineMenu();
    };
  }
}
