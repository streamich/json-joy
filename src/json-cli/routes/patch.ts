import {applyPatch, validateOperations, type Operation} from '../../json-patch';
import type {ObjectType} from '../../json-type';
import type {ObjectValue} from '../../json-type-value/ObjectValue';

export const definePatchRoutes = <Routes extends ObjectType<any>>(r: ObjectValue<Routes>) => {
  const {t, system} = r;
  system.alias('JsonPatch', t.Array(t.any));

  const Func = t
    .Function(
      t.Object(
        t.prop('doc', t.any).options({
          title: 'A document',
          description: 'A JSON document to apply the patch to.',
        }),
        t.prop('patch', t.Ref('JsonPatch')).options({
          title: 'A JSON Patch',
          description: 'A JSON Patch to apply to the document.',
        }),
      ),
      t.Object(
        t.propOpt('doc', t.any).options({
          title: '',
          description: 'JSON CRDT document.',
        }),
      ),
    )
    .options({
      title: 'Apply JSON Patch to a document',
      description: 'Applies a JSON Patch to a JSON document and returns the result.',
    });

  return r.prop('patch.apply', Func, async ({doc, patch}) => {
    validateOperations(patch as Operation[]);
    const result = applyPatch(doc, patch as Operation[], {mutate: true});
    return {
      doc: result,
    };
  });
};
