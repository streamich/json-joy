import {TypeSystem} from '../TypeSystem';

const createTypes = (system: TypeSystem) => {
  const t = system.t;

  // prettier-ignore
  const MuCollection = t.Object(
    t.prop('id', t.str),
    t.propOpt('name', t.str),
  );

  // prettier-ignore
  const MuBlock = t.Object(
    t.prop('id', t.str),
    t.prop('data', t.any),
  );

  // prettier-ignore
  const MuBlockCreateRequest = t.Object(
    t.propOpt('id', t.str),
  );
  const MuBlockCreateResponse = t.Object(t.prop('block', t.Ref<typeof MuBlock>('MuBlock')));
  const MuBlockNew = t.Function(MuBlockCreateRequest, MuBlockCreateResponse);

  const MuBlockGetRequest = t.Object(t.prop('id', t.str));
  const MuBlockGetResponse = t.Object(t.prop('block', t.Ref<typeof MuBlock>('block.Block')));
  const MuBlockGet = t.Function(MuBlockGetRequest, MuBlockGetResponse).options({
    title: 'Get Block',
    description: 'Get a block by ID',
  });

  const MuBlockListen = t.Function$(MuBlockGetRequest, MuBlockGetResponse);

  return {
    MuCollection,
    'aa.collection.create': t.Function(
      t.Object(t.prop('name', t.str)),
      t.Object(t.prop('collection', t.Ref<typeof MuCollection>('collection.Collection'))),
    ),

    MuBlock,
    MuBlockNew,
    MuBlockCreateRequest,
    MuBlockCreateResponse,
    MuBlockGet,
    MuBlockGetRequest,
    MuBlockGetResponse,
    MuBlockListen,
  };
};

const system = new TypeSystem();
const types = createTypes(system);
system.importTypes(types);

type Types = typeof types;
type Ctx = {ip?: string};
