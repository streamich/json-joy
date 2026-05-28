import type {JsonCrdtSelection} from './types';

/**
 * Holds the two-slot resolution state for a single peer's selection in a single
 * `(documentId, uiLocationId)`. The slots split the "intent" (what the peer
 * wants the cursor to be) from the "render state" (what we can actually show
 * given the model state we have).
 *
 * - `desired` is the *latest* incoming selection that could not (yet) be
 *   resolved against the local model — typically because the characters it
 *   anchors to have not arrived yet. LWW by sequence number.
 * - `displayed` is the *last* selection that resolved successfully. Editors
 *   render this. Offsets are recomputed each tick by the editor binding via
 *   `str.fromDto` / `peritext.fromDto`, which transparently handles the
 *   "advance through same-peer adjacent inserts" case.
 *
 * When `desired` resolves it is promoted to `displayed` and cleared.
 */
export class ResolvedSelection {
  constructor(
    public desired: JsonCrdtSelection | null = null,
    public displayed: JsonCrdtSelection | null = null,
    /** Last `peer.seq` we processed for this slot pair. */
    public seq: number = -1,
  ) {}
}
