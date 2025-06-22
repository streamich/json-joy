if (typeof Iterator === 'undefined' && typeof globalThis === 'object') {
  class Iterator<T> {
    [Symbol.iterator]() {
      return this;
    }

    /**
     * Returns the value of the first element in this iterator where predicate
     * is true, and `undefined` otherwise.
     *
     * @param predicate find calls predicate once for each element of this iterator, in
     *     order, until it finds one where predicate returns true. If such an element is found, find
     *     immediately returns that element value. Otherwise, find returns undefined.
     */
    find<S extends T>(predicate: (value: T, index: number) => value is S): S | undefined;
    find(predicate: (value: T, index: number) => unknown): T | undefined {
      let index = 0;
      for (const value of this as any) if (predicate(value, index++)) return value;
      return;
    }

    /**
     * Creates an iterator whose values are the result of applying the callback
     * to the values from this iterator.
     *
     * @param callbackfn A function that accepts up to two arguments to be used
     *     to transform values from the underlying iterator.
     */
    *map<U>(callbackfn: (value: T, index: number) => U): IteratorObject<U, undefined, unknown> {
      let index = 0;
      for (const value of this as any) yield callbackfn(value, index++);
    }

    /**
     * Creates an iterator whose values are those from this iterator for which
     * the provided predicate returns true.
     *
     * @param predicate A function that accepts up to two arguments to be used
     *     to test values from the underlying iterator.
     */
    filter<S extends T>(predicate: (value: T, index: number) => value is S): IteratorObject<S, undefined, unknown>
    *filter(predicate: (value: T, index: number) => unknown): IteratorObject<T, undefined, unknown> {
      let index = 0;
      for (const value of this as any) if (predicate(value, index++)) yield value;
    }

    /**
     * Creates an iterator whose values are the values from this iterator,
     * stopping once the provided limit is reached.
     *
     * @param limit The maximum number of values to yield.
     */
    *take(limit: number): IteratorObject<T, undefined, unknown> {
      let index = 0;
      for (const value of this as any) {
        if (index++ >= limit) break;
        yield value;
      }
    }

    /**
     * Creates an iterator whose values are the values from this iterator after
     * skipping the provided count.
     *
     * @param count The number of values to drop.
     */
    *drop(count: number): IteratorObject<T, undefined, unknown> {
      let index = 0;
      for (const value of this as any) {
        if (index++ < count) continue;
        yield value;
      }
    }

    /**
     * Creates an iterator whose values are the result of applying the callback
     * to the values from this iterator and then flattening the resulting
     * iterators or iterables.
     *
     * @param callback A function that accepts up to two arguments to be used
     * to transform values from the underlying iterator into new iterators or
     * iterables to be flattened into the result.
     */
    *flatMap<U>(callback: (value: T, index: number) => Iterator<U> | Iterable<U, unknown, undefined>): IteratorObject<U, undefined, unknown> {
      let index = 0;
      for (const value of this as any) {
        const result = callback(value, index++);
        if (result instanceof Iterator) {
          for (const item of result as any) yield item;
        } else {
          for (const item of result as Iterable<U, unknown, undefined>) yield item;
        }
      }
    }

    /**
     * Calls the specified callback function for all the elements in this
     * iterator. The return value of the callback function is the accumulated
     * result, and is provided as an argument in the next call to the callback
     * function.
     *
     * @param callbackfn A function that accepts up to three arguments.
     *     The reduce method calls the callbackfn function one time for each
     *     element in the iterator.
     * @param initialValue If initialValue is specified, it is used as the
     *     initial value to start the accumulation. The first call to the
     *     callbackfn function provides this value as an argument instead of a
     *     value from the iterator.
     */
    reduce(callbackfn: (previousValue: T, currentValue: T, currentIndex: number) => T): T;
    reduce(callbackfn: (previousValue: T, currentValue: T, currentIndex: number) => T, initialValue: T): T;
    reduce<U>(callbackfn: (previousValue: U, currentValue: T, currentIndex: number) => U, initialValue: U): U;
    reduce<U>(callbackfn: (previousValue: T | U, currentValue: T, currentIndex: number) => T | U, initialValue?: T | U): any {
      let index = 0;
      let accumulator: T | U = initialValue as any;
      for (const value of this as any)
        accumulator = callbackfn(accumulator, value, index++);
      return accumulator;
    }

    /**
     * Creates a new array from the values yielded by this iterator.
     */
    toArray(): T[] {
      return [...this as any];
    }

    /**
     * Performs the specified action for each element in the iterator.
     * @param callbackfn A function that accepts up to two arguments. forEach calls the callbackfn function one time for each element in the iterator.
     */
    forEach(callbackfn: (value: T, index: number) => void): void {
      let index = 0;
      for (const value of this as any) callbackfn(value, index++);
    }

    /**
     * Determines whether the specified callback function returns true for
     * any element of this iterator.
     *
     * @param predicate A function that accepts up to two arguments. The some
     *     method calls the predicate function for each element in this
     *     iterator until the predicate returns a value true, or until the end
     *     of the iterator.
     */
    some(predicate: (value: T, index: number) => unknown): boolean {
      let index = 0;
      for (const value of this as any)
        if (predicate(value, index++)) return true;
      return false;
    }

    /**
     * Determines whether all the members of this iterator satisfy the
     * specified test.
     *
     * @param predicate A function that accepts up to two arguments. The every
     *     method calls the predicate function for each element in this
     *     iterator until the predicate returns false, or until the end of
     *     this iterator.
     */
    every(predicate: (value: T, index: number) => unknown): boolean {
      let index = 0;
      for (const value of this as any)
        if (!predicate(value, index++)) return false;
      return true;
    }
  }

  /**
   * The `Iterator` global class is new, so we need to check if it exists.
   */
  (globalThis as any).Iterator = Iterator;
}
