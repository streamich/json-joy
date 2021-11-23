import {ITimestamp} from '../../../json-crdt-patch/clock';
import {ConstantType} from './ConstantType';

export class ConstantBuiltin extends ConstantType {
  constructor(id: ITimestamp, value: unknown) {
    super(id, value);
  }

  public toJson() {
    return this.value;
  }

  public clone(): ConstantType {
    return this;
  }

  public toString(tab: string = ''): string {
    switch (this.value) {
      case null:
        return tab + 'NULL';
      case true:
        return tab + 'TRUE';
      case false:
        return tab + 'FALSE';
      case undefined:
        return tab + 'UNDEFINED';
    }
    return tab + 'UNKNOWN';
  }
}
