import {Model} from '../../json-crdt';
import {Encoder as VerboseEncoder} from '../../json-crdt/codec/structural/verbose/Encoder';
import {Encoder as CompactEncoder} from '../../json-crdt/codec/structural/compact/Encoder';
import {encode as encodePatch} from '../../json-crdt-patch/codec/compact/encode';
import {ObjectType} from '../../json-type';
import {ObjectValue} from '../../json-type-value/ObjectValue';

export const defineCrdtRoutes = <Routes extends ObjectType<any>>(r: ObjectValue<Routes>) =>
  r.prop(
    'crdt.create',
    (t) =>
      t
        .Function(
          t.Object(
            t.propOpt('value', t.any).options({
              title: 'Initial value',
              description: 'Initial value of the JSON CRDT document. Can be any JSON value.',
            }),
            t.propOpt('sid', t.num).options({
              title: 'Session ID',
              description:
                'Session ID to use for the logic clock of the document. If not provided, a random number will be used.',
            }),
            t.propOpt('serverClock', t.bool).options({
              title: 'Use server clock',
              description:
                'Whether to use server logical clock for this document. If set to true, the session ID will be ignored set to 1.',
            }),
            t
              .propOpt(
                'codec',
                t.Or(t.Const(<const>'binary'), t.Const(<const>'compact'), t.Const(<const>'verbose')).options({
                  discriminator: ['?', ['==', ['$', ''], 'binary'], 0, ['?', ['==', ['$', ''], 'compact'], 1, 2]],
                }),
              )
              .options({
                title: 'Codec for the document',
                description: 'Codec to use for the document. Defaults to binary.',
              }),
          ),
          t.Object(
            t.prop('doc', t.any).options({
              title: 'JSON CRDT document',
              description: 'JSON CRDT document.',
            }),
            t.prop('codec', t.str),
            t.prop('patch', t.any),
          ),
        )
        .options({
          title: 'Create a CRDT document',
          description: 'Creates a new JSON CRDT document.',
        }),
    async ({value, sid, serverClock, codec}) => {
      const model = serverClock
        ? Model.withServerClock()
        : sid !== undefined
        ? Model.withLogicalClock(sid)
        : Model.withLogicalClock();
      if (value !== undefined) model.api.root(value);
      const patch = model.api.flush();
      const patchEncoded = patch && patch.ops.length ? encodePatch(patch) : null;
      codec ??= 'binary';
      let doc: any = null;
      switch (codec) {
        case 'binary': {
          doc = model.toBinary();
          break;
        }
        case 'compact': {
          const encoder = new CompactEncoder();
          doc = encoder.encode(model);
          break;
        }
        case 'verbose': {
          const encoder = new VerboseEncoder();
          doc = encoder.encode(model);
          break;
        }
        default:
          throw new Error(`Unknown codec: ${codec}`);
      }
      return {
        doc,
        codec,
        patch: patchEncoded,
      };
    },
  );
