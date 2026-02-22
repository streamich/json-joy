import {BehaviorSubject} from 'rxjs';
import {NiceUiContentService} from './NiceUiContentService';
import {NiceUiNavService} from './NiceUiNavService';

const isClient = typeof window === 'object';
const storage: Record<string, string> = isClient ? localStorage : ({} as Record<string, string>);

export interface NiceUiServicesOpts {
  nav?: NiceUiNavService;
  content?: NiceUiContentService;
}

export class NiceUiServices {
  public readonly theme$ = new BehaviorSubject<string | 'light' | 'dark'>('light');

  public readonly nav: NiceUiNavService;
  public readonly content: NiceUiContentService;

  constructor(opts: NiceUiServicesOpts = {}) {
    this.nav = opts.nav ?? new NiceUiNavService();
    this.content =
      opts.content ??
      new NiceUiContentService({
        root: {
          name: 'home',
          slug: '',
        },
      });
    const theme = storage['@onp4/ui/theme'];
    if (theme && this.theme$.value !== theme) this.theme$.next(theme);
  }

  public readonly setTheme = (theme: 'light' | 'dark' | 'auto' | '') => {
    this.theme$.next(theme);
    if (theme) storage['@onp4/ui/theme'] = theme;
    else delete storage['@onp4/ui/theme'];
  };
}
