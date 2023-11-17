import type {TypeRouter} from '../../json-type/system/TypeRouter';
import type {Services} from '../services/Services';

export interface RouteDeps {
  services: Services;
  router: TypeRouter<any>;
}
