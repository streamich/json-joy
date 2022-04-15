import {JsonPackValue} from "../json-pack";
import {encodeFull} from "../json-pack/util";

export interface JsonDocument {
  name: string;
  json: unknown;
  only?: true;
}

export const msgPackDocuments: JsonDocument[] = [
  {
    name: 'MessagePack value {foo: "bar"}',
    json: new JsonPackValue(encodeFull({foo: 'bar'})),
  },
  {
    name: 'MessagePack value null',
    json: new JsonPackValue(encodeFull(null)),
  },
  {
    name: 'MessagePack value in object',
    json: {
      foo: new JsonPackValue(encodeFull(null)),
    },
  },
  {
    name: 'MessagePack value in array',
    json: [
      new JsonPackValue(encodeFull(null)),
    ],
  },
];
