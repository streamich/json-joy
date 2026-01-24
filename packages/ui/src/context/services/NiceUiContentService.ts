import type {ContentPage} from '../../6-page/DocsPages/types';

export interface NiceUiContentServiceOpts {
  root: ContentPage;
}

export class NiceUiContentService {
  public root: ContentPage;

  constructor(opts: NiceUiContentServiceOpts) {
    this.root = opts.root;
  }
}
