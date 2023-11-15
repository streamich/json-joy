import {createCaller} from '../routes';
import {Services} from '../services/Services';

export const setup = () => {
  const services = new Services();
  const caller = createCaller(services);
  const call = caller.callSimple.bind(caller);
  return {services, caller, call};
};
