export class Fuzzer {
  public static generateInteger(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  public static pick<T>(elements: T[]): T {
    return elements[Math.floor(Math.random() * elements.length)];
  }

  public static repeat<T>(times: number, callback: () => T): T[] {
    const result: T[] = [];
    for (let i = 0; i < times; i++) result.push(callback());
    return result;
  }
}
