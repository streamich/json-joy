import type {Codegen} from '@jsonjoy.com/codegen';
import type {JsExpression} from '@jsonjoy.com/codegen/lib/util/JsExpression';
import type {
  AnyType,
  ArrType,
  BinType,
  BoolType,
  ConType,
  MapType,
  NumType,
  ObjType,
  KeyType,
  OrType,
  RefType,
  StrType,
  Type,
} from '../type';
import type {SchemaPath} from './types';

export abstract class AbstractCodegen<Fn extends (...deps: any[]) => any = (...deps: unknown[]) => unknown> {
  public abstract readonly codegen: Codegen<Fn>;

  protected abstract onAny(path: SchemaPath, r: JsExpression, type: AnyType): void;
  protected abstract onCon(path: SchemaPath, r: JsExpression, type: ConType): void;
  protected abstract onBool(path: SchemaPath, r: JsExpression, type: BoolType): void;
  protected abstract onNum(path: SchemaPath, r: JsExpression, type: NumType): void;
  protected abstract onStr(path: SchemaPath, r: JsExpression, type: StrType): void;
  protected abstract onBin(path: SchemaPath, r: JsExpression, type: BinType): void;
  protected abstract onArr(path: SchemaPath, r: JsExpression, type: ArrType): void;
  protected abstract onObj(path: SchemaPath, r: JsExpression, type: ObjType): void;
  protected abstract onKey(path: SchemaPath, r: JsExpression, type: KeyType<any, any>): void;
  protected abstract onMap(path: SchemaPath, r: JsExpression, type: MapType): void;
  protected abstract onRef(path: SchemaPath, r: JsExpression, type: RefType): void;
  protected abstract onOr(path: SchemaPath, r: JsExpression, type: OrType): void;

  public compile() {
    return this.codegen.compile();
  }

  protected onNode(path: SchemaPath, r: JsExpression, type: Type): void {
    const kind = type.kind();
    switch (kind) {
      case 'any':
        this.onAny(path, r, type as AnyType);
        break;
      case 'con':
        this.onCon(path, r, type as ConType);
        break;
      case 'bool':
        this.onBool(path, r, type as BoolType);
        break;
      case 'num':
        this.onNum(path, r, type as NumType);
        break;
      case 'str':
        this.onStr(path, r, type as StrType);
        break;
      case 'bin':
        this.onBin(path, r, type as BinType);
        break;
      case 'arr':
        this.onArr(path, r, type as ArrType);
        break;
      case 'obj':
        this.onObj(path, r, type as ObjType);
        break;
      case 'key':
        this.onKey(path, r, type as KeyType<any, any>);
        break;
      case 'map':
        this.onMap(path, r, type as MapType);
        break;
      case 'ref':
        this.onRef(path, r, type as RefType);
        break;
      case 'or':
        this.onOr(path, r, type as OrType);
        break;
      default:
        throw new Error(`Unsupported kind: ${kind}`);
    }
  }
}
