import {MulticodecIpld} from "../multiformats";
import {Codecs} from "./Codecs";
import {raw} from "./codecs/raw";
import {cbor} from "./codecs/cbor";

export * from './types';
export * from './Codecs';

export const codecs = new Codecs();

codecs.set(MulticodecIpld.Raw, raw);
codecs.set(MulticodecIpld.Cbor, cbor);
codecs.set(MulticodecIpld.DagCbor, cbor);
