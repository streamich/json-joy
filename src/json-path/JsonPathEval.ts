import {Value} from './Value';
import type * as types from './types';

export class JsonPathEval {
  constructor(
    public readonly path: types.JSONPath,
    public readonly data: unknown,
  ) {}

  eval() {
    let input: Value[] = [new Value(null, '$', this.data)];
    let output: Value[] = [];
    const segments = this.path.segments;
    const length = segments.length;
    for (let i = 0; i < length; i++) {
      output = this.evalSegment(input, segments[i]);
      input = output;
    }
    return output;
  }

  evalSegment(input: Value[], segment: types.PathSegment): Value[] {
    const output: Value[] = [];
    const selectors = segment.selectors;
    const length = selectors.length;
    for (let i = 0; i < length; i++) this.evalSelector(input, selectors[i], output);
    return output;
  }

  evalSelector(inputs: Value[], selector: types.AnySelector, output: Value[] = []): Value[] {
    switch (selector.type) {
      case 'name': {
        this.evalNamed(inputs, selector, output);
        break;
      }
      case 'index': {
        this.evalIndex(inputs, selector, output);
        break;
      }
    }
    return output;
  }

  protected evalNamed(inputs: Value[], selector: types.NamedSelector, output: Value[] = []): void {
    const length = inputs.length;
    for (let i = 0; i < length; i++) {
      const input = inputs[i];
      const data = input.data;
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        const key = selector.name;
        if (data.hasOwnProperty(key))
          output.push(new Value(input, key, (data as any)[key]));
      }
    }
  }

  protected evalIndex(inputs: Value[], selector: types.IndexSelector, output: Value[] = []): void {
    const length = inputs.length;
    for (let i = 0; i < length; i++) {
      const input = inputs[i];
      const data = input.data;
      if (!Array.isArray(data)) continue;
      const index = +selector.index;
      const child = (data as any)[index];
      if (child === undefined) continue;
      output.push(new Value(input, index, child));
    }
  }
}
