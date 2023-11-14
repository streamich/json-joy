import {RoutesBase, TypeRouter} from "../../../json-type/system/TypeRouter";
import {publish} from './publish';
import {subscribe} from './subscribe';

// prettier-ignore
export const pubsub = <R extends RoutesBase>(r: TypeRouter<R>) =>
  ( publish
  ( subscribe
  ( r )));
