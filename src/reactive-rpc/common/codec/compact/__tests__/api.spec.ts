import {runApiTests} from '../../../rpc/__tests__/api';
import {Encoder, Decoder} from '..';
import {createApiSetupWithCodec} from './createApiSetupWithCodec';

const setup = createApiSetupWithCodec({encoder: new Encoder(), decoder: new Decoder()});

runApiTests(setup);
