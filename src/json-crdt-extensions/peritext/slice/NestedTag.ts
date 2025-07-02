import {s} from "../../../json-crdt-patch";
import {ConApi, ObjApi, VecApi} from "../../../json-crdt/model";
import {ConNode, ObjNode, VecNode} from "../../../json-crdt/nodes";
import type {NestedType} from "./NestedType";

/**
 * Represents a single nested tag in a slice type. For example, in a slice type
 * like `['<blockquote>', 0, {author: 'Alice'}, ['<p>', 0, {indent: 2}]]`, there
 * is a tag for the blockquote and a tag for the paragraph. Each tag can
 * contain a discriminant and data.
 */
export class NestedTag<T = string> {
  constructor (protected readonly type: NestedType<T>, public readonly index: number) {}

  /**
   * Enforces current tag at `index` to be a "vec" node, which contains
   * a tag, a discriminant and an object with data.
   */
  public asVec(): VecApi<VecNode<[ConNode<number | string>, ConNode<number>, ObjNode]>> {
    const arr = this.type.asArr();
    let typeLen = arr.length();
    let index: number = this.index;
    if (typeof index !== 'number' || index > typeLen - 1) index = typeLen - 1;
    const vec = arr.get(index);
    if (vec instanceof VecApi) return vec;
    const tag = vec instanceof ConApi ? vec.view() : 0;
    arr.upd(index, s.vec(s.con(tag)));
    return arr.get(index) as VecApi;
  }

  /**
   * Returns the tag name at the current index, which is either a string or a number.
   * If the tag is not set, it returns `0`.
   *
   * @returns The tag value.
   */
  public name(): string | number {
    const vec = this.asVec();
    const tag = vec.select(0)?.view();
    return typeof tag === 'string' || typeof tag === 'number' ? tag : 0;
  }

  /**
   * Sets the tag name at the current index. If the tag is not a string or a number,
   * it will be converted to a string.
   *
   * @param tag - The tag value to set.
   */
  public setName(tag: string | number): void {
    const vec = this.asVec();
    vec.set([[0, s.con(tag)]]);
  }

  /**
   * Returns the discriminant of the tag at the current index.
   * If the discriminant is not set, it returns `0`.
   *
   * @returns The discriminant value.
   */
  public discriminant(): number {
    const disciminant = this.asVec().select(1)?.view() || 0;
    return typeof disciminant === 'number' ? disciminant : 0;
  }

  /**
   * Sets the discriminant of the tag at the current index.
   *
   * @param value - The discriminant value to set.
   */
  public setDiscriminant(value: number): void {
    const vec = this.asVec();
    vec.set([[1, s.con(value)]]);
  }

  /**
   * Returns the data object of the tag at the current index.
   * If the data is not set, it returns an empty object. Enforces the
   * data to be a {@link ObjApi} node, use this API to manipulate the data
   * object.
   *
   * @returns The data object.
   */
  public data(): ObjApi {
    const vec = this.asVec();
    const data = vec.select(2);
    if (data instanceof ObjApi) return data;
    vec.set([[2, s.obj({})]]);
    return vec.get(2) as ObjApi;
  }
}
