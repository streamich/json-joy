import {printTree} from 'tree-dump';
import type {Batch} from '../../json-crdt-patch/Batch';
import type {IClockVector} from '../../json-crdt-patch';
import {encoder, decoder} from './codec/binary/shared';
import {indent} from '../../json-crdt-patch/print';
import type {Printable} from 'tree-dump/lib/types';
import type {JsonCrdtOperation} from '../../json-crdt-patch/operations';

/**
 * Represents a single operation in a delta group. Conveniently, this is the
 * same as a JSON CRDT Patch operation, so we can directly apply these to the Model.
 */
export type DeltaMutator = JsonCrdtOperation;

/**
 * Represents a *Delta Group* - a missing state fragment that can be applied to
 * a CRDT state of another peer to "fill in" the missing state.
 */
export class Delta implements Printable {
  public static from(data: Uint8Array): Delta {
    return decoder.decodeDelta(data);
  }

  public meta: unknown = void 0;

  constructor(
    /**
     * The *Version Vector* - causal context of the start of the delta. I.e. this
     * is time boundary what the other peer sends to us, this is what the other
     * peer has already incorporated into their state.
     */
    public readonly vv0: IClockVector,

    /**
     * The *Version Vector* - causal context of the end of the delta. I.e. this
     * is what the delta incorporates up to. This is what peer 2 replies with.
     */
    public readonly vv1: IClockVector,

    /**
     * A list of *Delta Mutators* (operations) in this *Delta Group*. MUST be
     * applied in order.
     */
    public readonly batch: Batch,
  ) {}

  public toBinary(): Uint8Array {
    return encoder.encodeDelta(this);
  }

  // ---------------------------------------------------------------- Printable

  /**
   * Returns a textual human-readable representation of the delta. This can be
   * used for debugging purposes.
   *
   * @param tab Start string for each line.
   * @returns Text representation of the delta.
   */
  public toString(tab: string = ''): string {
    return (
      'Delta' +
      printTree(tab, [
        (tab) => 'meta' + printTree(tab, [(tab) => indent(tab, this.meta)]),
        (tab: string) => 'vv0: ' + this.vv0.toString(tab),
        (tab: string) => 'vv1: ' + this.vv1.toString(tab),
        (tab: string) => this.batch.toString(tab),
      ])
    );
  }
}
