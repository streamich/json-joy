import {Model} from '../../json-crdt';
import {TypeRouter, RoutesBase} from '../../json-type/system/TypeRouter';

export const defineCrdtRoutes = <Routes extends RoutesBase>(router: TypeRouter<Routes>) => {
  return router.extend(({t}) => {
    return {
      'crdt.create': t
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
          ),
          t.Object(
            t.propOpt('doc', t.any).options({
              title: 'JSON CRDT document',
              description: 'JSON CRDT document.',
            }),
          ),
        )
        .implement(async ({value, sid, serverClock}) => {
          const model = Model.withLogicalClock();
          return {
            doc: model.toBinary(),
          };
        }),
    };
  });
};
