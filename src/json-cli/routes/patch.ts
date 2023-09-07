import {applyPatch, validateOperations, type Operation} from '../../json-patch';
import {TypeRouter, RoutesBase} from '../../json-type/system/TypeRouter';

export const definePatchRoutes = <Routes extends RoutesBase>(router: TypeRouter<Routes>) => {
  return router.extend(({t}) => {
    return {
      'patch.apply': t
        .Function(
          t.Object(
            t.prop('doc', t.any).options({
              title: 'A document',
              description: 'A JSON document to apply the patch to.',
            }),
            t.prop('patch', t.Array(t.any)).options({
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
        })
        .implement(async ({doc, patch}) => {
          validateOperations(patch as Operation[]);
          const result = applyPatch(doc, patch as Operation[], {mutate: true});
          return {
            doc: result.doc,
          };
        }),
    };
  });
};
