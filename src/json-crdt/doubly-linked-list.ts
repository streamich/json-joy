import {CrdtType} from "./types";

export interface DoublyLinkedListEntry<T> {
  type?: CrdtType;
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

  public length(): number {
    let len: number = 0;
    let cur: any = this.start;
    while (cur) {
      len++;
      cur = cur.right;
    }
    return len;
  }

  public toString() {
    let str = '';
    let cur: any = this.start;
    while (cur) {
      str += cur.id.toString() + '\n';
      cur = cur.right;
    }
    return str;
  }
}
