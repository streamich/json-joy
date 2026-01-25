import type {Model, Patch} from 'json-joy/lib/json-crdt';
import {BehaviorSubject} from 'rxjs';
import type {Log} from 'json-joy/lib/json-crdt/log/Log';
import {last, prev, next} from 'sonic-forest/lib/util';
import {JsonCrdtPatchState} from '../JsonCrdtPatch/JsonCrdtPatchState';
import {JsonCrdtModelState} from '../JsonCrdtModel/JsonCrdtModelState';

export type JsonCrdtLogView = 'text' | 'timeline' | 'model';

export interface JsonCrdtLogStateOpts {
  view?: JsonCrdtLogView;
}

export class JsonCrdtLogState {
  public readonly view$: BehaviorSubject<JsonCrdtLogView>;
  public readonly pinned$ = new BehaviorSubject<null | 'start' | Patch>(null);
  public readonly pinnedModel$ = new BehaviorSubject<null | Model>(null);
  public readonly timelineScroll$ = new BehaviorSubject<number>(1);
  public readonly readonlyEnforced$ = new BehaviorSubject<number>(0);

  public readonly patchState = new JsonCrdtPatchState();
  public readonly modelState = new JsonCrdtModelState();

  constructor(
    public readonly log: Log<any>,
    {view = 'timeline'}: JsonCrdtLogStateOpts = {},
  ) {
    this.view$ = new BehaviorSubject<JsonCrdtLogView>(view);
  }

  public readonly setView = (view: JsonCrdtLogView) => {
    this.view$.next(view);
  };

  public readonly pin = (patch: 'start' | Patch | null) => {
    if (!patch) {
      this.pinned$.next(null);
      this.pinnedModel$.next(null);
      return;
    }
    let model: Model<any> | undefined;
    if (patch === 'start') {
      this.pinned$.next('start');
      model = this.log.start();
    } else {
      const id = patch?.getId();
      if (!id) return;
      this.pinned$.next(patch);
      model = this.log.replayTo(id);
    }
    const makeReadOnly = (model: Model) => {
      const unsubscribe = model.api.onBeforeLocalChange.listen(() => {
        unsubscribe();
        this.readonlyEnforced$.next(this.readonlyEnforced$.getValue() + 1);
        const model = patch === 'start' ? this.log.start() : this.log.replayTo(patch.getId()!);
        makeReadOnly(model);
        this.pinnedModel$.next(model);
      });
    };
    makeReadOnly(model);
    this.pinnedModel$.next(model);
  };

  public readonly next = (): void => {
    const pinned = this.pinned$.getValue();
    if (pinned === 'start') {
      const node = this.log.patches.first();
      if (node) this.pin(node.v);
      return;
    }
    const pinnedId = pinned?.getId();
    if (!pinnedId) return;
    const node = this.log.patches.find(pinnedId);
    if (!node) return;
    const prevNode = next(node as any);
    if (prevNode) this.pin(prevNode.v);
  };

  public readonly prev = (): void => {
    const pinned = this.pinned$.getValue();
    if (pinned === 'start') return;
    const pinnedId = pinned?.getId();
    if (!pinnedId) return;
    const node = this.log.patches.find(pinnedId);
    if (!node) return;
    const prevNode = prev(node as any);
    if (prevNode) this.pin(prevNode.v);
    else this.pin('start');
  };

  public readonly pause = (): void => {
    const node = last(this.log.patches.root);
    if (node) this.pin(node.v);
  };

  public readonly play = (): void => {
    this.pin(null);
    this.setTimelineScroll(1);
  };

  public readonly togglePlay = (): void => {
    const pinnedModel = this.pinnedModel$.getValue();
    if (pinnedModel) this.play();
    else this.pause();
  };

  public readonly setTimelineScroll = (scroll: number) => {
    this.timelineScroll$.next(scroll);
  };
}
