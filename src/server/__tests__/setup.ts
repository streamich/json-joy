import {createCaller} from '../routes';
import {Services} from '../services/Services';

export const setup = () => {
  const services = new Services();
  const caller = createCaller(services);
  return {services, caller};
};
