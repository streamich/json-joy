import {literal} from '@jsonjoy.com/json-expression/lib/util';
import {OpTree} from './tree';
import {toPath} from '@jsonjoy.com/json-pointer/lib/util';
import type {Operation} from '../../../json-patch';
import type {Expr} from '@jsonjoy.com/json-expression';
import type {JsonOp} from './types';

export const jsonPatchOpToJsonOp = (operation: Operation): JsonOp => {
  const op = operation.op;
  switch (op) {
    case 'test': {
      const value = literal(operation.value);
      const expression: Expr = [operation.not ? '!=' : '==', ['$', operation.path], value];
      return [[expression]];
    }
    case 'add': {
      return [[], [], [[0, operation.value]], [[0, toPath(operation.path)]]];
    }
    case 'remove': {
      const path = toPath(operation.path);
      return [[['$?', operation.path]], [[0, path]]];
    }
    case 'replace': {
      const path = toPath(operation.path);
      const test: Expr[] = path.length ? [['$?', operation.path]] : [];
      return [test, [[0, path]], [[1, operation.value]], [[1, path]]];
    }
    case 'move': {
      const path = toPath(operation.path);
      const from = toPath(operation.from);
      const test: Expr[] = from.length ? [['$?', operation.from]] : [];
      return [test, [[0, from]], [], [[0, path]]];
    }
    case 'copy': {
      const path = toPath(operation.path);
      const from = toPath(operation.from);
      return [
        [],
        [[0, from]],
        [],
        [
          [0, from],
          [0, path],
        ],
      ];
    }
  }
  return [[]];
};

export const toJsonOp = (patch: Operation[]): JsonOp => {
  const tree = OpTree.from([[]]);
  for (const op of patch) {
    const otOp = jsonPatchOpToJsonOp(op);
    // console.log(tree + '');
    const opTree = OpTree.from(otOp);
    // console.log(opTree + '');
    tree.compose(opTree);
    // console.log(tree + '');
  }
  return tree.toJson();
};
