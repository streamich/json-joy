import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import {Reader} from '@jsonjoy.com/buffers/lib/Reader';
import {SshEncoder} from '../SshEncoder';
import {SshDecoder} from '../SshDecoder';
import {JsonPackMpint} from '../../JsonPackMpint';

describe('SSH codec round-trip', () => {
  let writer: Writer;
  let reader: Reader;
  let encoder: SshEncoder;
  let decoder: SshDecoder;

  beforeEach(() => {
    writer = new Writer();
    reader = new Reader();
    encoder = new SshEncoder(writer);
    decoder = new SshDecoder(reader);
  });

  describe('boolean', () => {
    test('round-trips true', () => {
      encoder.writeBoolean(true);
      const encoded = writer.flush();
      reader.reset(encoded);
      expect(decoder.readBoolean()).toBe(true);
    });

    test('round-trips false', () => {
      encoder.writeBoolean(false);
      const encoded = writer.flush();
      reader.reset(encoded);
      expect(decoder.readBoolean()).toBe(false);
    });
  });

  describe('byte', () => {
    test('round-trips byte values', () => {
      encoder.writeByte(0);
      encoder.writeByte(127);
      encoder.writeByte(255);
      const encoded = writer.flush();
      reader.reset(encoded);
      expect(decoder.readByte()).toBe(0);
      expect(decoder.readByte()).toBe(127);
      expect(decoder.readByte()).toBe(255);
    });
  });

  describe('uint32', () => {
    test('round-trips various uint32 values', () => {
      const values = [0, 1, 127, 128, 255, 256, 65535, 65536, 0xffffffff];
      for (const value of values) {
        encoder.writeUint32(value);
      }
      const encoded = writer.flush();
      reader.reset(encoded);
      for (const value of values) {
        expect(decoder.readUint32()).toBe(value);
      }
    });
  });

  describe('uint64', () => {
    test('round-trips various uint64 values', () => {
      const values = [
        BigInt(0),
        BigInt(1),
        BigInt(127),
        BigInt(128),
        BigInt(255),
        BigInt(256),
        BigInt('0xFFFFFFFF'),
        BigInt('0x123456789ABCDEF'),
      ];
      for (const value of values) {
        encoder.writeUint64(value);
      }
      const encoded = writer.flush();
      reader.reset(encoded);
      for (const value of values) {
        expect(decoder.readUint64()).toBe(value);
      }
    });
  });

  describe('strings', () => {
    test('round-trips UTF-8 strings', () => {
      const strings = ['', 'hello', 'testing', 'Hello, World!', '🎉'];
      for (const str of strings) {
        encoder.writeStr(str);
      }
      const encoded = writer.flush();
      reader.reset(encoded);
      for (const str of strings) {
        expect(decoder.readStr()).toBe(str);
      }
    });

    test('round-trips ASCII strings', () => {
      const strings = ['', 'hello', 'testing', 'ABC123'];
      for (const str of strings) {
        encoder.writeAsciiStr(str);
      }
      const encoded = writer.flush();
      reader.reset(encoded);
      for (const str of strings) {
        expect(decoder.readAsciiStr()).toBe(str);
      }
    });

    test('round-trips binary strings', () => {
      const binaries = [
        new Uint8Array([]),
        new Uint8Array([0]),
        new Uint8Array([1, 2, 3, 4, 5]),
        new Uint8Array([0xff, 0xfe, 0xfd]),
      ];
      for (const bin of binaries) {
        encoder.writeBinStr(bin);
      }
      const encoded = writer.flush();
      reader.reset(encoded);
      for (const bin of binaries) {
        expect(decoder.readBinStr()).toEqual(bin);
      }
    });
  });

  describe('mpint', () => {
    test('round-trips various mpint values', () => {
      const values = [
        BigInt(0),
        BigInt(1),
        BigInt(-1),
        BigInt(127),
        BigInt(128),
        BigInt(-128),
        BigInt(-129),
        BigInt(0x80),
        BigInt(-1234),
        BigInt('0x9a378f9b2e332a7'),
        -BigInt('0xdeadbeef'),
      ];
      for (const value of values) {
        const mpint = JsonPackMpint.fromBigInt(value);
        encoder.writeMpint(mpint);
      }
      const encoded = writer.flush();
      reader.reset(encoded);
      for (const value of values) {
        const decoded = decoder.readMpint();
        expect(decoded.toBigInt()).toBe(value);
      }
    });
  });

  describe('name-list', () => {
    test('round-trips various name-lists', () => {
      const nameLists = [
        [],
        ['zlib'],
        ['zlib', 'none'],
        ['one', 'two', 'three'],
        ['algorithm1', 'algorithm2', 'algorithm3'],
      ];
      for (const nameList of nameLists) {
        encoder.writeNameList(nameList);
      }
      const encoded = writer.flush();
      reader.reset(encoded);
      for (const nameList of nameLists) {
        expect(decoder.readNameList()).toEqual(nameList);
      }
    });
  });

  describe('complex scenarios', () => {
    test('round-trips mixed data types', () => {
      // Encode
      encoder.writeBoolean(true);
      encoder.writeUint32(42);
      encoder.writeStr('hello');
      encoder.writeNameList(['one', 'two']);
      encoder.writeUint64(BigInt(123456789));
      const mpint = JsonPackMpint.fromBigInt(BigInt(-1234));
      encoder.writeMpint(mpint);
      encoder.writeBinStr(new Uint8Array([1, 2, 3]));

      const encoded = writer.flush();
      reader.reset(encoded);

      // Decode
      expect(decoder.readBoolean()).toBe(true);
      expect(decoder.readUint32()).toBe(42);
      expect(decoder.readStr()).toBe('hello');
      expect(decoder.readNameList()).toEqual(['one', 'two']);
      expect(decoder.readUint64()).toBe(BigInt(123456789));
      expect(decoder.readMpint().toBigInt()).toBe(BigInt(-1234));
      expect(decoder.readBinStr()).toEqual(new Uint8Array([1, 2, 3]));
    });

    test('round-trips SSH packet-like structure', () => {
      // Simulating an SSH key exchange packet
      encoder.writeByte(20); // SSH_MSG_KEXINIT
      encoder.writeBinStr(new Uint8Array(16).fill(0x42)); // cookie
      encoder.writeNameList(['diffie-hellman-group14-sha1']);
      encoder.writeNameList(['ssh-rsa']);
      encoder.writeNameList(['aes128-ctr']);
      encoder.writeNameList(['aes128-ctr']);
      encoder.writeNameList(['hmac-sha1']);
      encoder.writeNameList(['hmac-sha1']);
      encoder.writeNameList(['none']);
      encoder.writeNameList(['none']);
      encoder.writeNameList([]);
      encoder.writeNameList([]);
      encoder.writeBoolean(false);
      encoder.writeUint32(0);

      const encoded = writer.flush();
      reader.reset(encoded);

      expect(decoder.readByte()).toBe(20);
      expect(decoder.readBinStr()).toEqual(new Uint8Array(16).fill(0x42));
      expect(decoder.readNameList()).toEqual(['diffie-hellman-group14-sha1']);
      expect(decoder.readNameList()).toEqual(['ssh-rsa']);
      expect(decoder.readNameList()).toEqual(['aes128-ctr']);
      expect(decoder.readNameList()).toEqual(['aes128-ctr']);
      expect(decoder.readNameList()).toEqual(['hmac-sha1']);
      expect(decoder.readNameList()).toEqual(['hmac-sha1']);
      expect(decoder.readNameList()).toEqual(['none']);
      expect(decoder.readNameList()).toEqual(['none']);
      expect(decoder.readNameList()).toEqual([]);
      expect(decoder.readNameList()).toEqual([]);
      expect(decoder.readBoolean()).toBe(false);
      expect(decoder.readUint32()).toBe(0);
    });
  });
});
