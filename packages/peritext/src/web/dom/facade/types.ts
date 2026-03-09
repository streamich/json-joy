export interface DomFacade {
  el: DomFacadeElement;
  doc?: DomFacadeDocument;
  wnd?: Window;
}

export interface DomFacadeElement {
  contentEditable: string;
  style: {
    setProperty: (name: string, value: string) => void;
  };
  focus?(): void;
  querySelectorAll?(selector: string): NodeListOf<HTMLElement>;
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions,
  ): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
    options?: boolean | EventListenerOptions,
  ): void;
}

export interface DomFacadeDocument {
  addEventListener<K extends keyof DocumentEventMap>(
    type: K,
    listener: (this: Document, ev: DocumentEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions,
  ): void;
  removeEventListener<K extends keyof DocumentEventMap>(
    type: K,
    listener: (this: Document, ev: DocumentEventMap[K]) => any,
    options?: boolean | EventListenerOptions,
  ): void;
}
