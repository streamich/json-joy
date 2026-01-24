import {BehaviorSubject} from 'rxjs';
import {cdns} from './cdn';

export class IconsGridState {
  public cdn(cdn: 'jsdelivr' | 'unpkg' | 'esmsh' = 'jsdelivr'): string {
    return `${cdns.get(cdn)!.npm}iconista@2/`;
  }

  public href(set: string, icon: string, cdn: 'jsdelivr' | 'unpkg' | 'esmsh' = 'jsdelivr') {
    return `${cdns.get(cdn)!.npm}iconista@2/sets/${set}/${icon}.svg`;
  }

  public readonly sets$ = new BehaviorSubject<string[]>([]);
  public readonly icons$ = new BehaviorSubject<Map<string, string[]>>(new Map());
  public readonly selected$ = new BehaviorSubject<[set: string, icon: string] | null>(null);

  public async load() {
    const sets = await fetch(`${this.cdn()}sets/index.json`);
    const json = (await sets.json()) as string[];
    this.sets$.next(json);
    await Promise.all(
      json.map(async (set) => {
        const res = await fetch(`${this.cdn()}sets/${set}/index.json`);
        const json = (await res.json()) as string[];
        const icons = this.icons$.getValue();
        icons.set(set, json);
        this.icons$.next(icons);
      }),
    );
  }

  public readonly select = (set: string, icon: string) => {
    this.selected$.next([set, icon]);
  };

  public readonly unselect = () => {
    this.selected$.next(null);
  };

  private srcCache = new Map<string, string>();

  public async getIconSrc(set: string, icon: string): Promise<string> {
    const key = `${set}/${icon}`;
    const cached = this.srcCache.get(key);
    if (cached) return cached;
    const href = this.href(set, icon);
    const res = await fetch(href);
    const src = await res.text();
    this.srcCache.set(key, src);
    return src;
  }
}
