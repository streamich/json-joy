import {lazy} from '../../utils/lazy';

export default lazy((): any => {
  return import('.');
});
