import {ITimestamp, ServerTimestamp} from '../../../json-crdt-patch/clock';
import {Model} from '../../model';
import {AbstractDecoder} from './AbstractDecoder';
import {JsonCrdtServerSnapshot, JsonCrdtServerTimestamp} from './types';

export class ServerDecoder extends AbstractDecoder<JsonCrdtServerTimestamp> {
  public decode({time, root}: JsonCrdtServerSnapshot): Model {
    const doc = Model.withServerClock(time);
    this.decodeRoot(doc, root);
    return doc;
  }

  protected decodeTimestamp(time: JsonCrdtServerTimestamp): ITimestamp {
    return new ServerTimestamp(time);
  }
}
