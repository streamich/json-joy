import {rsync, UiLifeCycles} from '@jsonjoy.com/ui';
import {VoidMenu} from './VoidMenu';
import {EmbedButtonState} from './embed/EmbedButtonState';
import type {MuTxtState} from '../state/MuTxtState';
import type {AnchorPoint} from '@jsonjoy.com/ui/lib/utils/popup/types';

export class VoidState implements UiLifeCycles {
  public readonly menu: VoidMenu;
  public readonly open = rsync.val(false);
  public readonly embed: EmbedButtonState;

  constructor(
    private readonly mutxt: MuTxtState,
  ) {
    this.menu = new VoidMenu(mutxt);
    this.embed = new EmbedButtonState(mutxt);
  }

  public readonly start = (): (() => void) => {
    return () => {
    };
  };

  public point(): AnchorPoint | undefined {
    try {
      const focusRect = this.mutxt.api.focusRect();
      if (!focusRect) return;
      return {
        x: focusRect.left,
        y: focusRect.bottom + 4,
        dx: 0,
        dy: 1,
      };
    } catch {
      return;
    }
  }

  public readonly close = (): void => {
    this.open.set(false);
    this.mutxt.api.focus();
  };
}
