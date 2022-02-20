import {t} from '../json-type';
import {JsonSerializerCodegen, MsgPackSerializerCodegen} from '../json-type-serializer';
import {encoder} from '../json-pack/util';

const type = t.Object([t.Field('id', t.num), t.Field('name', t.str)]);

const jsonCodegen = new JsonSerializerCodegen({
  type,
});

const jsonSerializer = jsonCodegen.run().compile();

// tslint:disable-next-line no-console
console.log(jsonSerializer.toString());

// tslint:disable-next-line no-console
console.log(
  jsonSerializer({
    id: 123,
    name: 'John',
  }),
);

const msgpackCodegen = new MsgPackSerializerCodegen({
  type,
  encoder,
});

const msgpackSerializer = msgpackCodegen.run().compile();

// tslint:disable-next-line no-console
console.log(msgpackSerializer.toString());

// tslint:disable-next-line no-console
console.log(
  msgpackSerializer({
    id: 123,
    name: 'John',
  }),
);
