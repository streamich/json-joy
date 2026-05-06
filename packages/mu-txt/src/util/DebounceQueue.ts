export class DebounceQueue<T> {
  constructor(
    /**
     * Queue will be flushed when it reaches this number of items.
     */
    public itemLimit: number,

    /**
     * Queue will be flushed after this many milliseconds since the last item
     * was pushed, if it hasn't been flushed by item limit already.
     */
    public timeLimit: number,
  ) {}

  /**
   * Method that will be called when queue is flushed.
   */
  onflush = (_list: T[]) => {};

  private list: T[] = [];
  private timer: any = null;

  push(item: T) {
    this.list.push(item);
    if (this.list.length >= this.itemLimit) {
      this.flush();
      return;
    }
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.flush();
    }, this.timeLimit);
  }

  flush(): T[] {
    const list = this.list;
    this.list = [];
    clearTimeout(this.timer);
    this.timer = null;
    if (list.length) {
      try {
        this.onflush(list);
      } catch (error) {
        // tslint:disable-next-line
        console.error('DebounceQueue', error);
      }
    }
    return list;
  }
}
