import {Codegen, CodegenStepExecJs} from '@jsonjoy.com/codegen';
import {JsExpression} from '@jsonjoy.com/codegen/lib/util/JsExpression';
import {normalizeAccessor} from '@jsonjoy.com/codegen/lib/util/normalizeAccessor';
import {MaxEncodingOverhead, maxEncodingCapacity} from '@jsonjoy.com/util/lib/json-size';
import {BoolType, ConType, NumType, KeyOptType} from '../../type';
import type {AnyType, ArrType, BinType, MapType, KeyType, ObjType, OrType, RefType, StrType, Type} from '../../type';
import {DiscriminatorCodegen} from '../discriminator';
import {lazyKeyedFactory} from '../util';
import {AbstractCodegen} from '../AbstractCodege';
import type {SchemaPath} from '../types';
import {Value} from '../../value';

export type CompiledCapacityEstimator = (value: unknown) => number;

class IncrementSizeStep {
  constructor(public readonly inc: number) {}
}

export class CapacityEstimatorCodegen extends AbstractCodegen<CompiledCapacityEstimator> {
  public static readonly get = lazyKeyedFactory((type: Type, name?: string) => {
    const codegen = new CapacityEstimatorCodegen(type, name);
    const r = codegen.codegen.options.args[0];
    const expression = new JsExpression(() => r);
    codegen.onNode([], expression, type);
    return codegen.compile();
  });

  public readonly codegen: Codegen<CompiledCapacityEstimator>;

  constructor(
    public readonly type: Type,
    name?: string,
  ) {
    super();
    this.codegen = new Codegen({
      name: 'approxSize' + (name ? '_' + name : ''),
      args: ['r0'],
      prologue: /* js */ `var size = 0;`,
      epilogue: /* js */ `return size;`,
      linkable: {
        Value,
        get: CapacityEstimatorCodegen.get,
      },
      processSteps: (steps) => {
        const stepsJoined: CodegenStepExecJs[] = [];
        for (let i = 0; i < steps.length; i++) {
          const step = steps[i];
          if (step instanceof CodegenStepExecJs) stepsJoined.push(step);
          else if (step instanceof IncrementSizeStep) {
            stepsJoined.push(new CodegenStepExecJs(/* js */ `size += ${step.inc};`));
          }
        }
        return stepsJoined;
      },
    });
    this.codegen.linkDependency(maxEncodingCapacity, 'maxEncodingCapacity');
  }

  private inc(amount: number): void {
    this.codegen.js(/* js */ `size += ${amount};`);
  }

  protected onAny(path: SchemaPath, r: JsExpression, type: AnyType): void {
    const codegen = this.codegen;
    const rv = codegen.var(r.use());
    codegen.link('Value');
    codegen.link('get');
    codegen.if(
      /* js */ `${rv} instanceof Value`,
      () => {
        const rType = codegen.var(/* js */ `${rv}.type`);
        const rData = codegen.var(/* js */ `${rv}.data`);
        codegen.if(
          /* js */ `${rType}`,
          () => {
            codegen.js(/* js */ `size += get(${rType})(${rData});`);
          },
          () => {
            codegen.js(/* js */ `size += maxEncodingCapacity(${rData});`);
          },
        );
      },
      () => {
        codegen.js(/* js */ `size += maxEncodingCapacity(${rv});`);
      },
    );
  }

  protected onCon(path: SchemaPath, r: JsExpression, type: ConType): void {
    this.inc(maxEncodingCapacity(type.literal()));
  }

  protected onBool(path: SchemaPath, r: JsExpression, type: BoolType): void {
    this.inc(MaxEncodingOverhead.Boolean);
  }

  protected onNum(path: SchemaPath, r: JsExpression, type: NumType): void {
    this.inc(MaxEncodingOverhead.Number);
  }

  protected onStr(path: SchemaPath, r: JsExpression, type: StrType): void {
    this.inc(MaxEncodingOverhead.String);
    this.codegen.js(/* js */ `size += ${MaxEncodingOverhead.StringLengthMultiplier} * ${r.use()}.length;`);
  }

  protected onBin(path: SchemaPath, r: JsExpression, type: BinType): void {
    this.inc(MaxEncodingOverhead.Binary);
    this.codegen.js(/* js */ `size += ${MaxEncodingOverhead.BinaryLengthMultiplier} * ${r.use()}.length;`);
  }

  protected onArr(path: SchemaPath, r: JsExpression, type: ArrType): void {
    const codegen = this.codegen;
    this.inc(MaxEncodingOverhead.Array);
    const rLen = codegen.var(/* js */ `${r.use()}.length`);
    codegen.js(/* js */ `size += ${MaxEncodingOverhead.ArrayElement} * ${rLen}`);
    const {_head = [], _type, _tail = []} = type;
    const headLength = _head.length;
    const tailLength = _tail.length;
    if (_type) {
      const isConstantSizeType = _type instanceof ConType || _type instanceof BoolType || _type instanceof NumType;
      if (isConstantSizeType) {
        const elementSize =
          _type instanceof ConType
            ? maxEncodingCapacity(_type.literal())
            : _type instanceof BoolType
              ? MaxEncodingOverhead.Boolean
              : MaxEncodingOverhead.Number;
        codegen.js(/* js */ `size += (${rLen} - ${headLength + tailLength}) * ${elementSize};`);
      } else {
        const rv = codegen.var(r.use());
        const ri = codegen.getRegister();
        codegen.js(/* js */ `for(var ${ri} = ${headLength}; ${ri} < ${rLen} - ${tailLength}; ${ri}++) {`);
        this.onNode([...path, {r: ri}], new JsExpression(() => /* js */ `${rv}[${ri}]`), _type);
        codegen.js(/* js */ `}`);
      }
    }
    if (headLength > 0) {
      const rr = codegen.var(r.use());
      for (let i = 0; i < headLength; i++)
        this.onNode([...path, i], new JsExpression(() => /* js */ `${rr}[${i}]`), _head![i]);
    }
    if (tailLength > 0) {
      const rr = codegen.var(r.use());
      for (let i = 0; i < tailLength; i++)
        this.onNode(
          [...path, {r: `${rLen} - ${tailLength - i}`}],
          new JsExpression(() => /* js */ `${rr}[${rLen} - ${tailLength - i}]`),
          _tail![i],
        );
    }
  }

  protected onObj(path: SchemaPath, r: JsExpression, type: ObjType): void {
    const codegen = this.codegen;
    const rv = codegen.var(r.use());
    const encodeUnknownFields = !!type.schema.encodeUnknownKeys;
    if (encodeUnknownFields) {
      codegen.js(/* js */ `size += maxEncodingCapacity(${rv});`);
      return;
    }
    this.inc(MaxEncodingOverhead.Object);
    const fields = type.keys;
    for (const field of fields) {
      const accessor = normalizeAccessor(field.key);
      const fieldExpression = new JsExpression(() => `${rv}${accessor}`);
      const isOptional = field instanceof KeyOptType;
      if (isOptional) {
        codegen.if(/* js */ `${JSON.stringify(field.key)} in ${rv}`, () => {
          this.inc(MaxEncodingOverhead.ObjectElement);
          this.inc(maxEncodingCapacity(field.key));
          this.onNode([...path, field.key], fieldExpression, field.val);
        });
      } else {
        this.inc(MaxEncodingOverhead.ObjectElement);
        this.inc(maxEncodingCapacity(field.key));
        this.onNode([...path, field.key], fieldExpression, field.val);
      }
    }
  }

  protected onKey(path: SchemaPath, r: JsExpression, type: KeyType<any, any>): void {
    this.onNode([...path, type.key], r, type.val);
  }

  protected onMap(path: SchemaPath, r: JsExpression, type: MapType): void {
    const codegen = this.codegen;
    this.inc(MaxEncodingOverhead.Object);
    const rv = codegen.var(r.use());
    const rKeys = codegen.var(/* js */ `Object.keys(${rv})`);
    const rKey = codegen.var();
    const rLen = codegen.var(/* js */ `${rKeys}.length`);
    codegen.js(/* js */ `size += ${MaxEncodingOverhead.ObjectElement} * ${rLen}`);
    const valueType = type._value;
    const ri = codegen.var('0');
    codegen.js(/* js */ `for (; ${ri} < ${rLen}; ${ri}++) {`);
    codegen.js(/* js */ `${rKey} = ${rKeys}[${ri}];`);
    codegen.js(
      /* js */ `size += ${MaxEncodingOverhead.String} + ${MaxEncodingOverhead.StringLengthMultiplier} * ${rKey}.length;`,
    );
    this.onNode([...path, {r: rKey}], new JsExpression(() => /* js */ `${rv}[${rKey}]`), valueType);
    codegen.js(/* js */ `}`);
  }

  protected onRef(path: SchemaPath, r: JsExpression, type: RefType): void {
    const system = type.getSystem();
    const alias = system.resolve(type.ref());
    const estimator = CapacityEstimatorCodegen.get(alias.type);
    const d = this.codegen.linkDependency(estimator);
    this.codegen.js(/* js */ `size += ${d}(${r.use()});`);
  }

  protected onOr(path: SchemaPath, r: JsExpression, type: OrType): void {
    const codegen = this.codegen;
    const discriminator = DiscriminatorCodegen.get(type);
    const d = codegen.linkDependency(discriminator);
    const types = type.types;
    codegen.switch(
      /* js */ `${d}(${r.use()})`,
      types.map((childType: Type, index: number) => [
        index,
        () => {
          this.onNode(path, r, childType);
        },
      ]),
    );
  }
}
