import {location$} from 'rx-use/lib/location$';
import {pathname$} from 'rx-use/lib/pathname$';
import {BehaviorSubject} from 'rxjs';
import {go, type Go, type GoParams} from '../../misc/router';
import type {LocationState, ReadonlyBehaviorSubject} from 'rx-use';

const mapPath = (pathname: string) => {
  if (pathname[0] === '/') pathname = pathname.slice(1);
  return pathname.split('/');
};

export interface NiceUiNavServiceOpts {
  go?: Go;
}

export class NiceUiNavService {
  public readonly location$ = location$;
  public readonly pathname$ = pathname$;
  public readonly navigate: Go;

  /**
   * Splits pathname into steps list.
   *
   * '/foo/bar' => ['foo', 'bar']
   */
  public readonly steps$: ReadonlyBehaviorSubject<string[]>;

  constructor(opts: NiceUiNavServiceOpts = {}) {
    this.navigate =
      opts.go ??
      (typeof window === 'object'
        ? go
        : (((page: string, params?: GoParams) => {
            (location$ as BehaviorSubject<LocationState>).next({
              event: params?.replace ? 'replace' : 'push',
              state: params?.state,
              length: 0,
              hash: '',
              host: '',
              hostname: '',
              href: '',
              origin: '',
              pathname: page,
              port: '',
              protocol: '',
              search: '',
            });
          }) as Go));
    const steps$ = new BehaviorSubject<string[]>(mapPath(this.pathname$.getValue()));
    this.steps$ = steps$;
    this.pathname$.subscribe((pathname) => {
      if (typeof window === 'object') window.scrollTo(0, 0);
      steps$.next(mapPath(pathname));
    });
  }

  /**
   * ID of asset which is displayed on the page. Empty string if the currently
   * rendered page is not related to an asset.
   */
  public readonly pageAsset$ = new BehaviorSubject<string>('');

  public readonly go = (route: string, replace?: boolean, state?: unknown): void => {
    if (route[0] !== '/') route = '/' + route;
    this.navigate(route, {replace: !!replace, state});
  };

  public readonly updateQuery = (params?: Record<string, string | null>, replace?: boolean): void => {
    const urlSearchParams = new URLSearchParams(location.search);
    for (const [name, value] of Object.entries(params as object)) {
      if (typeof value !== 'string') {
        if (!value) {
          urlSearchParams.delete(name);
        } else {
          urlSearchParams.set(name, String(value));
        }
      } else {
        urlSearchParams.set(name, value);
      }
    }
    const search = urlSearchParams.toString();
    const route = location.pathname + (search ? '?' + search : '');
    this.go(route, replace);
  };
}
