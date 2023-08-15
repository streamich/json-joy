/* tslint:disable no-console */

import {Router} from '..';
import findMyWay from 'find-my-way';
import {RouteDefinition} from './routes';

export type RouterDefinition = {
  name: string;
  register: (def: RouteDefinition, data: any) => void;
  finalize?: () => void;
  print?: () => void;
  find: (method: string, path: string) => unknown;
};

export const routers: RouterDefinition[] = [];

const theRouter = new Router();
let matcher: any;
routers.push({
  name: 'json-joy router',
  register: ([method, steps]: RouteDefinition, data: any) => {
    const path = steps
      .map((step) => {
        if (typeof step === 'string') return step;
        if (Array.isArray(step)) {
          if (Array.isArray(step[0])) return `{${step[0][0]}::\n}`;
          else return `{${step[0]}}`;
        }
        return '';
      })
      .join('/');
    theRouter.add(`${method} /${path}`, data);
  },
  finalize: () => {
    matcher = theRouter.compile();
  },
  print: () => {
    console.log(theRouter + '');
    console.log(matcher + '');
  },
  find: (method: string, path: string) => {
    return matcher(method + ' ' + path);
  },
});

const router = findMyWay();
// router.prettyPrint();
routers.push({
  name: 'find-my-way',
  register: ([method, steps]: RouteDefinition, data: any) => {
    const path =
      '/' +
      steps
        .map((step) => {
          if (typeof step === 'string') return step;
          if (Array.isArray(step)) {
            if (Array.isArray(step[0])) return `*`;
            else return `:${step[0]}`;
          }
          return '';
        })
        .join('/');
    router.on(method, path, data);
  },
  find: (method: string, path: string) => {
    return router.find(method as any, path);
  },
});
