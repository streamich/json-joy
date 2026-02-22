import * as React from 'react';
import {Blogpost} from '.';
import {JsonCrdtModel} from '../../JsonCrdtModel';
import {Model} from 'json-joy/lib/json-crdt';
import {Log} from 'json-joy/lib/json-crdt/log/Log';
import {BlogpostSchema} from './schema';
import {JsonCrdtLog} from '../../JsonCrdtLog';

export default {
  component: Blogpost,
  title: 'examples/<Blogpost>',
};

const model = Model.create(BlogpostSchema);

export const Default = {
  render: () => <JsonCrdtModel model={model} renderDisplay={() => <Blogpost model={model} />} />,
};

const model2 = Model.create(BlogpostSchema);
const log = Log.fromNewModel(model2);
log.end.api.onLocalChange.listen(() => {
  log.end.api.flush();
});

export const History = {
  render: () => <JsonCrdtLog log={log} renderDisplay={(model) => <Blogpost model={model} />} />,
};
