import {create, inc} from './util';
import {Hlc} from './Hlc';

export interface HlcFactoryDependencies {
  /** Wall clock generator. */
  now?: () => number;

  /** ID of the current node/process. */
  node?: number;
}

const defaultNow = () => Math.round(Date.now() / 1000) - 2272147200;

export class HlcFactory {
  public id: Hlc;
  public readonly now: () => number;
  public readonly node: number;

  constructor({now = defaultNow, node = Math.round(Math.random() * 0xff)}: HlcFactoryDependencies) {
    this.now = now;
    this.node = node;
    this.id = new Hlc(now(), 0, node);
  }

  public create(): Hlc {
    return create(this.now(), this.node);
  }

  /**
   * @todo Is this method necessary?
   */
  public inc(): Hlc {
    const id = inc(this.id, this.now());
    this.id = id;
    return id;
  }
}
