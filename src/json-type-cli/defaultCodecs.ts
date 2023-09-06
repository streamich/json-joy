import {Writer} from "../util/buffers/Writer";
import {CliCodecs} from "./CliCodecs";
import {CliCodecCbor} from "./codecs/cbor";
import {CliCodecJson} from "./codecs/json";
import {CliCodecMsgpack} from "./codecs/msgpack";
import {CliCodecRaw} from "./codecs/raw";
import {CliCodecText} from "./codecs/text";
import {CliCodecTree} from "./codecs/tree";
import {CliCodecUbjson} from "./codecs/ubjson";

export const defaultCodecs = new CliCodecs();

const writer = new Writer(16 * 1024);
defaultCodecs.register(new CliCodecJson(writer));
defaultCodecs.register(new CliCodecCbor(writer));
defaultCodecs.register(new CliCodecMsgpack(writer));
defaultCodecs.register(new CliCodecUbjson(writer));
defaultCodecs.register(new CliCodecText());
defaultCodecs.register(new CliCodecTree());
defaultCodecs.register(new CliCodecRaw());
