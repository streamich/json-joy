const {default: Delta} = require('quill-delta');

const opToDelta = (op) => {
  const deltaOp = [];
  for (const component of op) {
    if (typeof component === 'string') {
      deltaOp.push({insert: component});
    } else if (typeof component === 'number') {
      if (component > 0) {
        deltaOp.push({retain: component});
      } else {
        deltaOp.push({delete: -component});
      }
    } else if (typeof component === 'object') {
      deltaOp.push({delete: component[0].length});
    }
  }
  return deltaOp;
};

const serialize = (d) => d.ops;
const deserialize = (ops) => new Delta(ops);
const create = (str) => deserialize(str ? [{insert: str}] : []);
const apply = (d1, d2) => d1.compose(d2);
const compose = apply;
const transform = (d1, d2) => d1.transform(d2);

module.exports = {
  opToDelta,
  serialize,
  deserialize,
  create,
  apply,
  compose,
  transform,
};
