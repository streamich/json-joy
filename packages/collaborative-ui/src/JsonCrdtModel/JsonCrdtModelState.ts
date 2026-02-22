import {BehaviorSubject} from 'rxjs';
import {JsonBlockState} from '../JsonBlock/JsonBlockState';

export type JsonCrdtModelView =
  | 'interactive'
  | 'index'
  | 'verbose'
  | 'compact'
  | 'binary'
  | 'indexed'
  | 'sidecar'
  | 'debug';

export class JsonCrdtModelState {
  public readonly showModel$ = new BehaviorSubject<boolean>(true);
  public readonly showDisplay$ = new BehaviorSubject<boolean>(true);
  public readonly showView$ = new BehaviorSubject<boolean>(false);
  public readonly showDisplayOutlines$ = new BehaviorSubject<boolean>(false);
  public readonly viewState = new JsonBlockState();
  public readonly modelView$ = new BehaviorSubject<JsonCrdtModelView>('interactive');
  public readonly readonly$ = new BehaviorSubject<boolean>(false);

  public readonly toggleShowModel = () => {
    this.showModel$.next(!this.showModel$.getValue());
  };

  public readonly toggleShowView = () => {
    this.showView$.next(!this.showView$.getValue());
  };

  public readonly toggleShowDisplay = () => {
    this.showDisplay$.next(!this.showDisplay$.getValue());
  };

  public readonly setModelView = (view: JsonCrdtModelView) => {
    this.modelView$.next(view);
  };
}
