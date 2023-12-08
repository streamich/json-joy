import {update} from './methods/update';
import {listen} from './methods/listen';
import {remove} from './methods/remove';
import {PresenceEntry} from './schema';
import type {RouteDeps, Router, RouterBase} from '../types';

export const presence =
  (d: RouteDeps) =>
  <R extends RouterBase>(r: Router<R>) => {
    d.system.alias('PresenceEntry', PresenceEntry);

    // prettier-ignore
    return (
      ( update(d)
      ( remove(d)
      ( listen(d)
      ( r )))));
  };
