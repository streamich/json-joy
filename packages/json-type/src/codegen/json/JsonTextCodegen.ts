import {toBase64} from '@jsonjoy.com/base64/lib/toBase64';
import {Codegen, CodegenStepExecJs} from '@jsonjoy.com/codegen';
import {JsExpression} from '@jsonjoy.com/codegen/lib/util/JsExpression';
import {normalizeAccessor} from '@jsonjoy.com/codegen/lib/util/normalizeAccessor';
import {stringify} from '@jsonjoy.com/json-pack/lib/json-binary/codec';
import {asString} from '@jsonjoy.com/util/lib/strings/asString';
import {KeyOptType} from '../../type';
import {DiscriminatorCodegen} from '../discriminator';
import {lazyKeyedFactory} from '../util';
import {Value} from '../../value';
import type {json_string} from '@jsonjoy.com/util/lib/json-brand';
import type {ArrType, ConType, MapType, ObjType, OrType, RefType, StrType, Type} from '../../type';

export type JsonEncoderFn = <T>(value: T) => json_string<T>;

class WriteTextStep {
  constructor(public str: string) {}
}

type Step = WriteTextStep | CodegenStepExecJs;

export class JsonTextCodegen {
  public static readonly get = lazyKeyedFactory((type: Type, name?: string) => {
    const codegen = new JsonTextCodegen(type, name);
    const r = codegen.codegen.options.args[0];
    const expression = new JsExpression(() => r);
    codegen.onNode(expression, type);
    return codegen.compile();
  });

  public readonly codegen: Codegen<JsonEncoderFn>;

  constructor(
    protected readonly type: Type,
    name?: string,
  ) {
    this.codegen = new Codegen<JsonEncoderFn>({
      name: 'toJson' + (name ? '_' + name : ''),
      prologue: `var s = '';`,
      epilogue: `return s;`,
      linkable: {
        toBase64,
        Value,
        getEncoder: JsonTextCodegen.get,
      },
      processSteps: (steps) => {
        const stepsJoined: Step[] = [];
        for (let i = 0; i < steps.length; i++) {
          const step = steps[i];
          if (step instanceof CodegenStepExecJs) stepsJoined.push(step);
          else if (step instanceof WriteTextStep) {
            const last = stepsJoined[stepsJoined.length - 1];
            if (last instanceof WriteTextStep) last.str += step.str;
            else stepsJoined.push(step);
          }
        }
        const execSteps: CodegenStepExecJs[] = [];
        for (const step of stepsJoined) {
          if (step instanceof CodegenStepExecJs) {
            execSteps.push(step);
          } else if (step instanceof WriteTextStep) {
            const js = /* js */ `s += ${JSON.stringify(step.str)};`;
            execSteps.push(new CodegenStepExecJs(js));
          }
        }
        return execSteps;
      },
    });
    this.codegen.linkDependency(asString, 'asString');
    this.codegen.linkDependency(stringify, 'stringify');
  }

  public js(js: string): void {
    this.codegen.js(js);
  }

  public writeText(str: string): void {
    this.codegen.step(new WriteTextStep(str));
  }

  public compile() {
    return this.codegen.compile();
  }

  protected onArr(value: JsExpression, type: ArrType<any, any, any>): void {
    this.writeText('[');
    const codegen = this.codegen;
    const r = codegen.getRegister(); // array
    const rl = codegen.getRegister(); // array.length
    const rll = codegen.getRegister(); // last
    const ri = codegen.getRegister(); // index
    this.js(/* js */ `var ${r} = ${value.use()}, ${rl} = ${r}.length, ${rll} = ${rl} - 1, ${ri} = 0;`);
    this.js(/* js */ `for(; ${ri} < ${rll}; ${ri}++) ` + '{');
    this.onNode(new JsExpression(() => `${r}[${ri}]`), type._type);
    this.js(/* js */ `s += ',';`);
    this.js(/* js */ `}`);
    this.js(/* js */ `if (${rl}) {`);
    this.onNode(new JsExpression(() => `${r}[${rll}]`), type._type);
    this.js(/* js */ `}`);
    this.writeText(']');
  }

  protected onObj(value: JsExpression, objType: ObjType): void {
    const {keys: fields} = objType;
    const schema = objType.getOptions();
    const codegen = this.codegen;
    const r = codegen.getRegister();
    this.js(/* js */ `var ${r} = ${value.use()};`);
    const rKeys = this.codegen.getRegister();
    if (schema.encodeUnknownKeys) {
      this.js(/* js */ `var ${rKeys} = new Set(Object.keys(${r}));`);
    }
    const requiredFields = fields.filter((field) => !(field instanceof KeyOptType));
    const optionalFields = fields.filter((field) => field instanceof KeyOptType) as KeyOptType<string, Type>[];
    this.writeText('{');
    for (let i = 0; i < requiredFields.length; i++) {
      const field = requiredFields[i];
      if (i) this.writeText(',');
      this.writeText(JSON.stringify(field.key) + ':');
      const accessor = normalizeAccessor(field.key);
      const valueExpression = new JsExpression(() => `${r}${accessor}`);
      if (schema.encodeUnknownKeys) this.js(/* js */ `${rKeys}.delete(${JSON.stringify(field.key)});`);
      this.onNode(valueExpression, field.val);
    }
    const rHasFields = codegen.getRegister();
    if (!requiredFields.length) this.js(/* js */ `var ${rHasFields} = false;`);
    for (let i = 0; i < optionalFields.length; i++) {
      const field = optionalFields[i];
      const accessor = normalizeAccessor(field.key);
      const rValue = codegen.getRegister();
      if (schema.encodeUnknownKeys) this.js(/* js */ `${rKeys}.delete(${JSON.stringify(field.key)});`);
      this.js(/* js */ `var ${rValue} = ${r}${accessor};`);
      this.js(`if (${rValue} !== undefined) {`);
      if (requiredFields.length) {
        this.writeText(',');
      } else {
        this.js(`if (${rHasFields}) s += ',';`);
        this.js(/* js */ `${rHasFields} = true;`);
      }
      this.writeText(JSON.stringify(field.key) + ':');
      const valueExpression = new JsExpression(() => `${rValue}`);
      this.onNode(valueExpression, field.val);
      this.js(`}`);
    }
    if (schema.encodeUnknownKeys) {
      const [rList, ri, rLength, rk] = [codegen.r(), codegen.r(), codegen.r(), codegen.r()];
      this.js(`var ${rLength} = ${rKeys}.size;
if (${rLength}) {
  var ${rk}, ${rList} = Array.from(${rKeys}.values());
  for (var ${ri} = 0; ${ri} < ${rLength}; ${ri}++) {
    ${rk} = ${rList}[${ri}];
    s += ',' + asString(${rk}) + ':' + stringify(${r}[${rk}]);
  }
}`);
    }
    this.writeText('}');
  }

  protected onMap(value: JsExpression, type: MapType<any>): void {
    this.writeText('{');
    const r = this.codegen.var(value.use());
    const rKeys = this.codegen.var(/* js */ `Object.keys(${r})`);
    const rLength = this.codegen.var(/* js */ `${rKeys}.length`);
    const rKey = this.codegen.var();
    this.codegen.if(/* js */ `${rLength}`, () => {
      this.js(/* js */ `${rKey} = ${rKeys}[0];`);
      this.js(/* js */ `s += asString(${rKey}) + ':';`);
      const innerValue = new JsExpression(() => /* js */ `${r}[${rKey}]`);
      this.onNode(innerValue, type._value);
    });
    this.js(/* js */ `for (var i = 1; i < ${rLength}; i++) {`);
    this.js(/* js */ `${rKey} = ${rKeys}[i];`);
    this.js(/* js */ `s += ',' + asString(${rKey}) + ':';`);
    const innerValue = new JsExpression(() => /* js */ `${r}[${rKey}]`);
    this.onNode(innerValue, type._value);
    this.js(/* js */ `}`);
    this.writeText('}');
  }

  protected onRef(value: JsExpression, ref: RefType<any>): void {
    const system = ref.system;
    if (!system) throw new Error('NO_SYSTEM');
    const alias = system.resolve(ref.ref());
    const fn = JsonTextCodegen.get(alias.type, alias.id);
    const d = this.codegen.linkDependency(fn);
    this.js(/* js */ `s += ${d}(${value.use()});`);
  }

  protected onOr(value: JsExpression, type: OrType): void {
    const codegen = this.codegen;
    const discriminator = DiscriminatorCodegen.get(type);
    const d = codegen.linkDependency(discriminator);
    const types = type.types;
    codegen.switch(
      `${d}(${value.use()})`,
      types.map((childType: Type, index: number) => [
        index,
        () => {
          this.onNode(value, childType);
        },
      ]),
    );
  }

  public onNode(value: JsExpression, type: Type): void {
    const kind = type.kind();
    const codegen = this.codegen;
    switch (kind) {
      case 'any': {
        const r = codegen.var(value.use());
        codegen.link('Value');
        codegen.link('getEncoder');
        codegen.if(
          /* js */ `${r} instanceof Value`,
          () => {
            const rType = codegen.var(/* js */ `${r}.type`);
            const rData = codegen.var(/* js */ `${r}.data`);
            codegen.if(
              /* js */ `${rType}`,
              () => {
                codegen.js(/* js */ `s += getEncoder(${rType})(${rData});`);
              },
              () => {
                codegen.js(`s += stringify(${rData});`);
              },
            );
          },
          () => {
            codegen.js(`s += stringify(${r});`);
          },
        );
        break;
      }
      case 'bool': {
        this.js(/* js */ `s += ${value.use()} ? 'true' : 'false';`);
        break;
      }
      case 'num': {
        this.js(/* js */ `s += '' + ${value.use()};`);
        break;
      }
      case 'str': {
        const strType = type as StrType;
        if (strType.getSchema().noJsonEscape) {
          this.writeText('"');
          this.js(/* js */ `s += ${value.use()};`);
          this.writeText('"');
        } else {
          this.js(/* js */ `s += asString(${value.use()});`);
        }
        break;
      }
      case 'bin': {
        this.codegen.link('toBase64');
        this.writeText('"data:application/octet-stream;base64,');
        this.js(/* js */ `s += toBase64(${value.use()});`);
        this.writeText('"');
        break;
      }
      case 'con': {
        const constType = type as ConType;
        this.js(/* js */ `s += ${JSON.stringify(stringify(constType.literal()))}`);
        break;
      }
      case 'arr': {
        this.onArr(value, type as ArrType<any, any, any>);
        break;
      }
      // case 'tup':
      //   tup(ctx, value, type, generate);
      //   break;
      case 'obj': {
        this.onObj(value, type as ObjType);
        break;
      }
      case 'map': {
        this.onMap(value, type as MapType<any>);
        break;
      }
      case 'ref': {
        this.onRef(value, type as RefType<any>);
        break;
      }
      case 'or': {
        this.onOr(value, type as OrType<any>);
        break;
      }
      default:
        throw new Error(`${kind} type JSON text encoding not implemented`);
    }
  }
}
