import {LogicalVectorClock, ITimestamp, IClock, LogicalTimestamp} from './clock';
import {Patch} from './Patch';
import {PatchBuilder} from './PatchBuilder';

/**
 * Draft class provides a way to build a patch for which it is not known the
 * LogicalClock value yet, it then can construct a Patch with any starting
 * LogicalClock value.
 *
 * It works by creating a temporary patch with LogicalClock that starts at (sessionId = -1, time = 0)
 * and then it can replay the temporary patch while replacing the placeholder
 * timestamps with real values.
 *
 * You use `draft.builder` to construct the temporary patch and then provide the
 * real clock to the `patch` method to compute the actual patch with correct timestamps.
 *
 * ```ts
 * const draft = new Draft();
 * const str = draft.builder.str();
 * draft.builder.insStr(str, str, 'abc');
 * draft.builder.root(str);
 * const patch = draft.patch(clock);
 * ````
 */
export class Draft {
  public readonly builder = new PatchBuilder(new LogicalVectorClock(-1, 0));

  /**
   * Creates a new patch where all timestamps with (sessionId == -1) are replaced
   * with correct timestamps.
   */
  public patch(clock: IClock): Patch {
    return this.builder.patch.rewriteTime((id: ITimestamp) =>
      id.getSessionId() !== -1 ? id : new LogicalTimestamp(clock.getSessionId(), clock.time + id.time),
    );
  }
}
