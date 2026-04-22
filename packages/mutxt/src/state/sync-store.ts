const getCookie = (key: string): string | null => {
  const name = key + "=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i].trim();
    if (c.indexOf(name) === 0) return c.substring(name.length, c.length);
  }
  return null;
};

export interface ISyncStore {
  setItem(key: string, value: string): void;
  getItem(key: string): string | null;
  removeItem(key: string): void;
}

class CookieStore implements ISyncStore {
  constructor(
    private cache: Map<string, string> | undefined = new Map(),  
  ) {}

  public setItem(key: string, value: string): void {
    this.cache?.set(key, value);
    document.cookie = `${key}=${encodeURIComponent(value)}; path=/; SameSite=Lax`;
  }

  public getItem(key: string): string | null {
    if (this.cache?.has(key)) return this.cache.get(key)!;
    const cookieVal = getCookie(key);
    return cookieVal ?? null;
  }

  public removeItem(key: string): void {
    this.cache?.delete(key);
    document.cookie = `${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }
}

class MemoryStore implements ISyncStore {
  private cache: Map<string, string> = new Map();

  public setItem(key: string, value: string): void {
    this.cache.set(key, value);
  }

  public getItem(key: string): string | null {
    return this.cache.get(key) ?? null;
  }

  public removeItem(key: string): void {
    this.cache.delete(key);
  }
}

export const getSyncStore = (): ISyncStore => {
  try {
    const testKey = '__sync_store_test__';
    localStorage.setItem(testKey, ' ');
    localStorage.removeItem(testKey);
    return localStorage;
  } catch {
    try {
      if (typeof document.cookie === 'string') return new CookieStore();
      throw 1;
    } catch {
      return new MemoryStore();
    }
  }
};
