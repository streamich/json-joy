import * as React from 'react';
import {rsync} from '@jsonjoy.com/ui';
import {Iconista} from '@jsonjoy.com/ui/lib/icons/Iconista';
import type {AnchorPoint} from '@jsonjoy.com/ui/lib/utils/popup/types';
import type {MenuItem} from '@jsonjoy.com/ui/lib/4-card/StructuralMenu/types';
import type {MuTxtState} from '../../../state/MuTxtState';

export class SlashMenuState {
  public readonly open = rsync.val(false);

  /** Set when Esc closes the menu; next "/" inserts literally instead of re-opening. */
  private escapeMode = false;

  constructor(private readonly mutxt: MuTxtState) {}

  /** Call this when the user presses "/". Returns true if the key was consumed
   * (should not be inserted into document). */
  public readonly handleSlashKey = (): boolean => {
    if (this.escapeMode) {
      this.escapeMode = false;
      return false;
    }
    this.open.set(true);
    return true;
  };

  public readonly close = (): void => {
    this.escapeMode = true;
    this.open.set(false);
    this.mutxt.api.focus();
  };

  public readonly menu: MenuItem = {
    name: 'Insert',
    children: [
      {
        name: 'Embed',
        icon: () => <Iconista set="lucide" icon="link-2" width={16} height={16} />,
        onSelect: (event: React.MouseEvent) => {
          event.preventDefault();
          this.open.set(false);
          this.mutxt.requestEmbedMenu?.();
        },
      },
    ],
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
}
