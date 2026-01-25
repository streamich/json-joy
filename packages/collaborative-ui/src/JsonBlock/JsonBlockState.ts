import {BehaviorSubject} from 'rxjs';

export type JsonBlockViewTab = 'text' | 'json' | 'interactive' | 'minified';

export class JsonBlockState {
  public readonly view$ = new BehaviorSubject<JsonBlockViewTab>('interactive');
  public readonly path$ = new BehaviorSubject<string>('');

  public readonly setView = (view: JsonBlockViewTab) => {
    this.view$.next(view);
  };

  public readonly setPath = (path: string) => {
    this.path$.next(path);
  };
}
