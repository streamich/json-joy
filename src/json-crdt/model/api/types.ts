import type {Const} from "../../types/const/Const";
import type {ArrayLww} from "../../types/lww-array/ArrayLww";
import type {ObjectLww} from "../../types/lww-object/ObjectLww";
import type {RootLww} from "../../types/lww-root/RootLww";
import type {ValueLww} from "../../types/lww-value/ValueLww";
import type {ArrayRga} from "../../types/rga-array/ArrayRga";
import type {BinaryRga} from "../../types/rga-binary/BinaryRga";
import type {StringRga} from "../../types/rga-string/StringRga";
import type {ArrayApi, BinaryApi, ConstApi, ObjectApi, StringApi, TupleApi, ValueApi} from "./nodes";

// prettier-ignore
export type JsonNodeApi<N> = N extends Const<any>
  ? ConstApi<N>
  : N extends RootLww<any>
    ? ValueApi<N>
    : N extends ValueLww<any>
      ? ValueApi<N>
      : N extends StringRga
        ? StringApi
        : N extends BinaryRga
          ? BinaryApi
          : N extends ArrayRga<any>
            ? ArrayApi<N>
            : N extends ObjectLww<any>
              ? ObjectApi<N>
              : N extends ArrayLww<any>
                ? TupleApi<N>
                : never;
