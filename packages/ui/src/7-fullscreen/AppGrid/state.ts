import * as rsync from '../../utils/rsync';

export type SidebarState = 'open' | 'close' | 'mini' | 'none';

export class AppGridState {
  public readonly overlay = rsync.val(typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches);
  public readonly leftState = rsync.val<SidebarState>(this.overlay.value ? 'none' : 'open');
  public readonly rightState = rsync.val<SidebarState>('none');
  public readonly leftSize = rsync.val(300);
  public readonly rightSize = rsync.val(300);

  leftVisible(): boolean {
    const state = this.leftState.value;
    return state === 'open' || state === 'mini';
  }

  rightVisible(): boolean {
    const state = this.rightState.value;
    return state === 'open' || state === 'mini';
  }

  public readonly closeLeftIfOverlay = () => {
    if (this.overlay.value) this.leftState.next('close');
  };

  public readonly closeRightIfOverlay = () => {
    if (this.overlay.value) this.rightState.next('close');
  };

  public readonly setSizes = (sizes: number[]) => {
    let i = 0;
    if (this.leftVisible()) {
      this.leftSize.next(sizes[i++]);
    }
    i++; // middle
    if (this.rightVisible()) {
      this.rightSize.next(sizes[i++]);
    }
  };

  public readonly toggleLeft = () => {
    const leftState = this.leftState;
    const leftStateValue = leftState.value;
    leftState.next(leftStateValue === 'open' ? 'close' : 'open');
  };
}
