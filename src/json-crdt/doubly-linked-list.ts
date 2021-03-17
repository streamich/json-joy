export interface DoublyLinkedListEntry<T> {
  left: DoublyLinkedListEntry<T> | null;
  right: DoublyLinkedListEntry<T> | null;
}

export class DoublyLinkedList<T> {
  public start: (DoublyLinkedListEntry<T> & T) | null = null;
  public end: (DoublyLinkedListEntry<T> & T) | null = null;

  public append(entry: DoublyLinkedListEntry<T> & T) {
    const last = this.end;
    entry.right = null;
    this.end = entry;
    if (!last) {
      entry.left = null;
      this.start = entry;
    } else {
      last.right = entry;
      entry.left = last;
    }
  }
}
