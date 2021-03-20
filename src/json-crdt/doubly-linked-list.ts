import {CrdtType} from "./types";

export interface DoublyLinkedListEntry<T> {
  type?: CrdtType;
  left: DoublyLinkedListEntry<T> | null;
  right: DoublyLinkedListEntry<T> | null;
}

export interface DoublyLinkedList<T> {
  start: (T & DoublyLinkedListEntry<T>) | null;
  end: (T & DoublyLinkedListEntry<T>) | null;
}

export const append = <T>(list: DoublyLinkedList<T>, entry: DoublyLinkedListEntry<T> & T) => {
  const last = list.end;
  entry.right = null;
  list.end = entry;
  if (!last) {
    entry.left = null;
    list.start = entry;
  } else {
    last.right = entry;
    entry.left = last;
  }
};

export const length = <T>(list: DoublyLinkedList<T>): number => {
  let len: number = 0;
  let cur: any = list.start;
  while (cur) {
    len++;
    cur = cur.right;
  }
  return len;
};

export const toString = <T>(list: DoublyLinkedList<T>): string => {
  let str = '';
  let cur: any = list.start;
  while (cur) {
    str += cur.id.toString() + '\n';
    cur = cur.right;
  }
  return str;
};
