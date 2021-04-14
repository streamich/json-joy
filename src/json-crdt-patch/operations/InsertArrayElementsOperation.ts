import type {IJsonCrdtPatchOperation} from './types';
import type {ITimestamp} from '../clock';

export class InsertArrayElementsOperation implements IJsonCrdtPatchOperation {
  /**
   * @param id ID if the first operation in this compound operation.
   * @param arr ID of the array where to insert elements. In theory `arr` is
   *        not necessary as it is possible to find the `arr` just using the
   *        `after` property, however to efficiently be able to find `arr` just
   *        by `after` at runtime all operations would need to be indexed and
   *        also they each would need to store a pointer to array type, which
   *        would require additional dozens of bytes of RAM for each array
   *        insert operation.
   * @param after ID of the element after which to insert elements.
   * @param elements The elements to insert.
   */
  constructor(
    public readonly id: ITimestamp,
    public readonly arr: ITimestamp,
    public readonly after: ITimestamp,
    public readonly elements: ITimestamp[],
  ) {}

  public span(): number {
    return this.elements.length;
  }

  public getMnemonic(): string {
    return 'arr_ins';
  }
}
