import {ModuleType} from '..';

const createTypes = (system: ModuleType) => {
  const t = system.t;

  // prettier-ignore
  const MuCollection = t.Object(t.Key('id', t.str), t.KeyOpt('name', t.str));

  // prettier-ignore
  const MuBlock = t.Object(t.Key('id', t.str), t.Key('data', t.any));

  // prettier-ignore
  const MuBlockCreateRequest = t.Object(t.KeyOpt('id', t.str));
  const MuBlockCreateResponse = t.Object(t.Key('block', t.Ref<typeof MuBlock>('MuBlock')));
  const MuBlockNew = t.Function(MuBlockCreateRequest, MuBlockCreateResponse);

  const MuBlockGetRequest = t.Object(t.Key('id', t.str));
  const MuBlockGetResponse = t.Object(t.Key('block', t.Ref<typeof MuBlock>('block.Block')));
  const MuBlockGet = t.Function(MuBlockGetRequest, MuBlockGetResponse).options({
    title: 'Get Block',
    description: 'Get a block by ID',
  });

  const MuBlockListen = t.Function$(MuBlockGetRequest, MuBlockGetResponse);

  return {
    MuCollection,
    'aa.collection.create': t.Function(
      t.Object(t.Key('name', t.str)),
      t.Object(t.Key('collection', t.Ref<typeof MuCollection>('collection.Collection'))),
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

const system = new ModuleType();
const types = createTypes(system);
system.importTypes(types);
