import {BehaviorSubject} from 'rxjs';

export type JsonCrdtPatchView = 'index' | 'verbose' | 'compact' | 'binary' | 'indexed' | 'sidecar' | 'text';

export class JsonCrdtPatchState {
  public readonly show$ = new BehaviorSubject<boolean>(true);
  public readonly view$ = new BehaviorSubject<JsonCrdtPatchView>('text');

  public readonly toggleShow = () => {
    this.show$.next(!this.show$.getValue());
  };

  public readonly setView = (view: JsonCrdtPatchView) => {
    this.view$.next(view);
  };
}
