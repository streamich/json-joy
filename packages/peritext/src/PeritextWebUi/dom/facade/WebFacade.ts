import type {DomFacade, DomFacadeDocument, DomFacadeElement} from './types';

export class WebFacade implements DomFacade {
  constructor (
    public readonly el: DomFacadeElement,
    public readonly doc: DomFacadeDocument | undefined = typeof document !== 'undefined' ? document : void 0,
  ) {}
}
