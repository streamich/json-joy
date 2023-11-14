import {update} from './methods/update';
import {listen} from './methods/listen';
import {PresenceEntry} from './schema';
import type {RoutesBase, TypeRouter} from '../../../json-type/system/TypeRouter';
import type {RouteDeps} from '../types';

export const presence =
  (d: RouteDeps) =>
  <R extends RoutesBase>(r: TypeRouter<R>) => {
    r.system.alias('PresenceEntry', PresenceEntry);

    // prettier-ignore
    return (
    ( update(d)
    ( listen(d)
    ( r )))
  );
  };
