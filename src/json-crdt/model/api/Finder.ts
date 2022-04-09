import {ArrayType} from '../../types/rga-array/ArrayType';
import type {JsonNode} from '../../types';
import {NULL, UNDEFINED} from '../../constants';
import {ObjectType} from '../../types/lww-object/ObjectType';
import type {Path} from '../../../json-pointer';
import {ValueApi} from './ValueApi';
import {ValueType} from '../../types/lww-value/ValueType';
import {StringApi} from './StringApi';
import {StringType} from '../../types/rga-string/StringType';
import {ArrayApi} from './ArrayApi';
import {ObjectApi} from './ObjectApi';
import type {ModelApi} from './ModelApi';

export class Finder {
  constructor(protected readonly node: JsonNode, protected readonly api: ModelApi) {}

  public find(steps: Path): JsonNode {
    let node: JsonNode = this.node || NULL;
    const length = steps.length;
    if (!length) return node;
    let i = 0;
    while (i < length) {
      const step = steps[i++];
      if (node instanceof ObjectType) {
        const id = node.get(String(step));
        if (!id) return UNDEFINED;
        const nextNode = this.api.model.node(id);
        if (!nextNode) return UNDEFINED;
        node = nextNode;
      } else if (node instanceof ArrayType) {
        const id = node.findValue(Number(step));
        const nextNode = this.api.model.node(id);
        if (!nextNode) return UNDEFINED;
        node = nextNode;
        continue;
      }
    }
    return node;
  }

  public val(path: Path): ValueApi {
    const node = this.find(path);
    if (node instanceof ValueType) return new ValueApi(this.api, node);
    throw new Error('NOT_VAL');
  }

  public str(path: Path): StringApi {
    const node = this.find(path);
    if (node instanceof StringType) return new StringApi(this.api, node);
    throw new Error('NOT_STR');
  }

  public arr(path: Path): ArrayApi {
    const node = this.find(path);
    if (node instanceof ArrayType) return new ArrayApi(this.api, node);
    throw new Error('NOT_ARR');
  }

  public obj(path: Path): ObjectApi {
    const obj = this.find(path);
    if (obj instanceof ObjectType) return new ObjectApi(this.api, obj);
    throw new Error('NOT_OBJ');
  }
}
