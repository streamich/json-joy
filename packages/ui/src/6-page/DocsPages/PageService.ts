import {concurrency} from 'thingies/lib/concurrency';

export class PageService {
  public toggleAdmin() {
    const isAdmin = !!localStorage.getItem('ff.isAdmin');
    if (isAdmin) localStorage.removeItem('ff.isAdmin');
    else localStorage.setItem('ff.isAdmin', '1');
    (window as any).location = window.location; // eslint-disable-line no-self-assign
  }

  private preloadLimiter = concurrency(3);
  public preload(exec: () => Promise<unknown>): void {
    this.preloadLimiter(exec).catch((error) => {
      console.log('Preload error');
      console.error(error);
    });
  }
}
