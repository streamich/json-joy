import * as React from 'react';
import {ReplicatedStr} from 'collaborative-editor/lib/replicated-str/ReplicatedStr';
import {FanOut} from 'thingies/lib/fanout';
import type {ReplicatedStrFacade} from 'collaborative-editor/lib/replicated-str/types';
import type {CollaborativeStr} from 'collaborative-editor';

class StrFacade implements ReplicatedStrFacade {
  constructor(protected value: string = '') {}
  public readonly onChange = new FanOut<string>();
  public readonly view = () => this.value;
  public readonly set = (value: string) => {
    if (value === this.value) return;
    this.value = value;
    this.onChange.emit(value);
  };
  public readonly ins = (pos: number, text: string) => {
    const value = this.value;
    const next = value.slice(0, pos) + text + value.slice(pos);
    this.set(next);
  };
  public readonly del = (pos: number, length: number) => {
    const value = this.value;
    const next = value.slice(0, pos) + value.slice(pos + length);
    this.set(next);
  };
  public readonly subscribe = (listener: () => void): (() => void) => {
    return this.onChange.listen(() => listener());
  };
}

export interface StrAdapterNativeProps {
  value: string;
  onChange: (value: string) => void;
  children: (str: () => CollaborativeStr) => React.ReactNode;
}

export const StrAdapterNative: React.FC<StrAdapterNativeProps> = (props) => {
  // biome-ignore lint: manually managed dependency list
  const [facade, str] = React.useMemo(() => {
    const facade = new StrFacade(props.value);
    const str = new ReplicatedStr(facade);
    facade.onChange.listen((value) => {
      props.onChange(value);
    });
    return [facade, () => str];
  }, []);

  facade.set(props.value);

  return props.children(str);
};
