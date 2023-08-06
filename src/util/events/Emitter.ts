export interface EventListenerOptions {
  capture?: boolean;
}

export interface AddEventListenerOptions extends EventListenerOptions {
  once?: boolean;
  passive?: boolean;
  signal?: AbortSignal;
}

export class Emitter<EventMap> {
  private readonly et = new EventTarget();

  public on<K extends keyof EventMap>(
    type: K,
    listener: (ev: EventMap[K]) => any,
    options?: boolean | AddEventListenerOptions,
  ): void {
    this.et.addEventListener(<string>type, <any>listener, options);
  }

  public emit<K extends keyof EventMap>(event: EventMap[K]): boolean {
    return this.et.dispatchEvent(<CustomEvent<any>>event);
  }

  public off<K extends keyof EventMap>(
    type: K,
    listener: (ev: EventMap[K]) => any,
    options?: boolean | EventListenerOptions,
  ): void {
    this.et.removeEventListener(<string>type, <any>listener, options);
  }
}
