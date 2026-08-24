const buildTypedEventTargetType = () => {
  const klass = class TypedEventTarget<EventMap> {
    addEventListener<K extends keyof EventMap>(
      type: K,
      listener: (this: HTMLElement, ev: EventMap[K]) => any,
      options?: boolean | AddEventListenerOptions,
    ): void;
    addEventListener(
      type: string,
      callback: EventListenerOrEventListenerObject | null,
      options?: AddEventListenerOptions | boolean,
    ): void;
    addEventListener(): void {}
    dispatchEvent(event: EventMap[keyof EventMap]): boolean;
    dispatchEvent(event: Event): boolean;
    dispatchEvent(): boolean {
      return true;
    }
    removeEventListener<K extends keyof EventMap>(
      type: K,
      listener: (this: HTMLElement, ev: EventMap[K]) => any,
      options?: boolean | EventListenerOptions,
    ): void;
    removeEventListener(
      type: string,
      callback: EventListenerOrEventListenerObject | null,
      options?: EventListenerOptions | boolean,
    ): void;
    removeEventListener(): void {}
  };
  return EventTarget as unknown as typeof klass;
};

export const TypedEventTarget = buildTypedEventTargetType();

export interface TypedEventTarget<EventMap> {
  addEventListener<K extends keyof EventMap>(
    type: K,
    listener: (this: HTMLElement, ev: EventMap[K]) => any,
    options?: boolean | AddEventListenerOptions,
  ): void;
  addEventListener(
    type: string,
    callback: EventListenerOrEventListenerObject | null,
    options?: AddEventListenerOptions | boolean,
  ): void;
  dispatchEvent(event: EventMap[keyof EventMap]): boolean;
  dispatchEvent(event: Event): boolean;
  removeEventListener<K extends keyof EventMap>(
    type: K,
    listener: (this: HTMLElement, ev: EventMap[K]) => any,
    options?: boolean | EventListenerOptions,
  ): void;
  removeEventListener(
    type: string,
    callback: EventListenerOrEventListenerObject | null,
    options?: EventListenerOptions | boolean,
  ): void;
}

export class SubscriptionEventTarget<EventMap> extends TypedEventTarget<EventMap> {
  public subscribe<K extends keyof EventMap>(type: K, listener: (ev: EventMap[K]) => void): () => void {
    this.addEventListener(type, listener);
    return () => this.removeEventListener(type, listener);
  }
}
