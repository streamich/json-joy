import {Cli, CliOptions} from "./Cli";
// import * as util from './services/util/methods/echo';
// import * as crdt from './services/crdt/methods/create';

// const options: CliOptions<crdt.Methods> = {
//   define: crdt.define,
//   implement: crdt.implement,
// };

const cli = new Cli();
const {t} = cli;

cli.register(
  'util.echo',
  t.any,
  t.any,
  async (req) => {
    return req;
  },
);

cli.register(
  'crdt.create',
  t.Object(
    t.propOpt('sid', t.num),
    t.propOpt('value', t.any),
  ),
  t.num,
  // t.Object(
  //   t.prop('doc', t.num),
  // ),
  async (req) => {
    
    return 123;
  },
);

const res = t.Object(
  t.prop('doc', t.any),
);

cli.register(
  'crdt.create2',
  t.Object(
    t.propOpt('sid', t.num),
    t.propOpt('value', t.any),
  ),
  res,
  async ({sid, value}) => {
    return {doc: {}};
  },
);

cli.run();
