import {rsync} from '@jsonjoy.com/ui';
import type {ISyncStore} from './sync-store';

export type ThemePreference = 'auto' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'mutxt_theme';

const isPreference = (val: unknown): val is ThemePreference =>
  val === 'auto' || val === 'light' || val === 'dark';

const detectSystemTheme = (): ResolvedTheme => {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export class Theme {
  public readonly preference: rsync.ReactValue<ThemePreference>;
  public readonly resolved: rsync.ReactValue<ResolvedTheme>;
  private mediaQuery: MediaQueryList | null = null;

  constructor(private readonly sync: ISyncStore) {
    const stored = sync.getItem(STORAGE_KEY);
    const preference: ThemePreference = isPreference(stored) ? stored : 'auto';
    this.preference = rsync.val<ThemePreference>(preference);
    this.resolved = rsync.val<ResolvedTheme>(this.resolve(preference));
    this.attachMedia();
  }

  private resolve(preference: ThemePreference): ResolvedTheme {
    return preference === 'auto' ? detectSystemTheme() : preference;
  }

  private readonly onSystemChange = () => {
    if (this.preference.value === 'auto') {
      this.resolved.set(detectSystemTheme());
    }
  };

  private attachMedia(): void {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.mediaQuery.addEventListener('change', this.onSystemChange);
  }

  public readonly set = (preference: ThemePreference): void => {
    if (this.preference.value === preference) return;
    this.preference.set(preference);
    this.sync.setItem(STORAGE_KEY, preference);
    this.resolved.set(this.resolve(preference));
  };

  public dispose(): void {
    this.mediaQuery?.removeEventListener('change', this.onSystemChange);
    this.mediaQuery = null;
  }
}
