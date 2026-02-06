import {FanOut, type FanOutUnsubscribe, type FanOutListener} from 'thingies/lib/fanout';

/**
 * Merges multiple fanouts into a single fanout. The merged fanout emits the
 * same data as the source fanouts.
 */
export class MergeFanOut<D> extends FanOut<D> {
  private unsubs: FanOutUnsubscribe[] = [];

  constructor(
    private readonly fanouts: FanOut<any>[],
    private readonly mappper: (data: any) => D = (data) => data,
  ) {
    super();
  }

  public listen(listener: FanOutListener<D>): FanOutUnsubscribe {
    if (!this.listeners.size)
      this.unsubs = this.fanouts.map((fanout) => fanout.listen((data) => this.emit(this.mappper(data))));
    const unsub = super.listen(listener);
    return () => {
      unsub();
      if (!this.listeners.size) {
        for (const unsub of this.unsubs) unsub();
        this.unsubs = [];
      }
    };
  }
}

/**
 * Buffers data from a fanout and emits the buffered data once per microtask.
 */
export class MicrotaskBufferFanOut<I> extends FanOut<I[]> {
  private buffer: I[] = [];
  private unsub?: FanOutUnsubscribe = undefined;

  constructor(private readonly source: FanOut<I>) {
    super();
  }

  public listen(listener: FanOutListener<I[]>): FanOutUnsubscribe {
    if (!this.unsub) {
      this.unsub = this.source.listen((data) => {
        const buffer = this.buffer;
        if (!buffer.length) {
          queueMicrotask(() => {
            this.emit(buffer);
            this.buffer = [];
          });
        }
        buffer.push(data);
      });
    }
    const unsub = super.listen(listener);
    return () => {
      unsub();
      if (!this.listeners.size) this.clear();
    };
  }

  public clear() {
    this.listeners.clear();
    this.buffer = [];
    this.unsub?.();
    this.unsub = undefined;
  }
}

/**
 * Maps the data from a fanout using a mapper function.
 */
export class MapFanOut<I, O> extends FanOut<O> {
  constructor(
    private readonly source: FanOut<I>,
    private readonly mapper: (data: I) => O,
  ) {
    super();
  }

  private unsub?: FanOutUnsubscribe = undefined;

  public listen(listener: FanOutListener<O>): FanOutUnsubscribe {
    if (!this.unsub) this.unsub = this.source.listen((data) => this.emit(this.mapper(data)));
    const unsub = super.listen(listener);
    return () => {
      unsub();
      if (!this.listeners.size) this.clear();
    };
  }

  public clear() {
    this.listeners.clear();
    this.unsub?.();
    this.unsub = undefined;
  }
}

/**
 * Emits only when the source fanout emits a new value. The first value is
 * emitted immediately.
 */
export class OnNewFanOut<D> extends FanOut<D> {
  private unsub?: FanOutUnsubscribe = undefined;

  constructor(
    private readonly source: FanOut<D>,
    private last: D | undefined = undefined,
  ) {
    super();
  }

  public listen(listener: FanOutListener<D>): FanOutUnsubscribe {
    if (!this.unsub) {
      this.unsub = this.source.listen((data) => {
        if (this.last !== data) this.emit((this.last = data));
      });
    }
    const unsub = super.listen(listener);
    return () => {
      unsub();
      if (!this.listeners.size) this.clear();
    };
  }

  public clear() {
    this.listeners.clear();
    this.last = undefined;
    this.unsub?.();
    this.unsub = undefined;
  }
}
