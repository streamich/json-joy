import {rsync} from '@jsonjoy.com/ui';
import {TranslitService} from '../../translit/TranslitService';
import {TranslitMenu} from './TranslitMenu';
import type {UiLifeCycles} from '@jsonjoy.com/ui/lib/types';
import type {MuTxtState} from '../state/MuTxtState';
import type {TranslitScheme} from '../../translit/types';

export class MuTxtTranslit extends TranslitService implements UiLifeCycles {
  public state?: MuTxtState;
  public readonly menu: TranslitMenu = new TranslitMenu(this);
  public readonly mapOpen = rsync.val<string | null>(null);

  public readonly openMap = (id?: string): void => {
    const target = id ?? this.active.value ?? this.lastUsed.value ?? this.list()[0]?.id ?? null;
    this.mapOpen.set(target);
  };

  public readonly closeMap = (): void => {
    this.mapOpen.set(null);
  };

  constructor(schemes?: Iterable<TranslitScheme>) {
    super(schemes);
  }

  public bindState(state: MuTxtState): void {
    this.state = state;
  }

  public start(): () => void {
    return this.menu.start();
  }
}
