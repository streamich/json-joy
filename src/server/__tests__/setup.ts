import {createCaller} from '../routes';

export const setup = () => {
  const caller = createCaller();
  return {caller};
};
