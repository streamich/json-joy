import {Slices} from './Slices';

export class ExtraSlices<T = string> extends Slices<T> {
  public toStringName(): string {
    return 'ExtraSlices';
  }
}
