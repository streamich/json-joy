import {Key} from './Key';
import {Signature} from './types';

export class KeyMap {
  protected downSingle: Map<string, () => void> = new Map();
  protected upSingle: Map<string, () => void> = new Map();

  public onDown(signature: Signature, action: () => void): (() => void) {
    const map = this.downSingle;
    map.set(signature, action);
    return () => {
      if (map.get(signature) === action) map.delete(signature);
    };
  }

  public onUp(signature: Signature, action: () => void): (() => void) {
    const map = this.upSingle;
    map.set(signature, action);
    return () => {
      if (map.get(signature) === action) map.delete(signature);
    };
  }

  public match(press: Key): (() => void) | undefined {
    const signature = press.sig();
    const action = this.downSingle.get(signature);
    return action;
  }
}
