import {nfs} from '../builder';
import {Nfsv4Attr} from '../constants';
import * as structs from '../structs';

describe('nfs helpers', () => {
  describe('operation builders', () => {
    it('PUTROOTFH creates request', () => {
      const req = nfs.PUTROOTFH();
      expect(req).toBeInstanceOf(Object);
    });

    it('LOOKUP creates request with name', () => {
      const req = nfs.LOOKUP('file.txt');
      expect(req).toBeInstanceOf(Object);
    });

    it('ACCESS creates request with default mask', () => {
      const req = nfs.ACCESS();
      expect(req).toBeInstanceOf(Object);
    });

    it('READDIR creates request with defaults', () => {
      const req = nfs.READDIR(0x00000001);
      expect(req).toBeInstanceOf(Object);
    });
  });
});

describe('nfsStruct helpers', () => {
  describe('verifier', () => {
    it('creates verifier with zeros by default', () => {
      const verifier = nfs.Verifier();
      expect(verifier).toBeInstanceOf(structs.Nfsv4Verifier);
      expect(verifier.data).toHaveLength(8);
      expect(verifier.data.every((b) => b === 0)).toBe(true);
    });

    it('creates verifier with provided data', () => {
      const data = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
      const verifier = nfs.Verifier(data);
      expect(verifier.data).toEqual(data);
    });
  });

  describe('stateid', () => {
    it('creates stateid with defaults', () => {
      const stateid = nfs.Stateid();
      expect(stateid).toBeInstanceOf(structs.Nfsv4Stateid);
      expect(stateid.seqid).toBe(0);
      expect(stateid.other).toHaveLength(12);
    });

    it('creates stateid with custom seqid', () => {
      const stateid = nfs.Stateid(42);
      expect(stateid.seqid).toBe(42);
    });
  });

  describe('fattr', () => {
    it('creates fattr from attribute numbers', () => {
      const attrVals = new Uint8Array([1, 2, 3, 4]);
      const fattr = nfs.Fattr([Nfsv4Attr.FATTR4_TYPE, Nfsv4Attr.FATTR4_SIZE], attrVals);
      expect(fattr).toBeInstanceOf(structs.Nfsv4Fattr);
      expect(fattr.attrmask).toBeInstanceOf(structs.Nfsv4Bitmap);
      expect(fattr.attrVals).toEqual(attrVals);
    });

    it('converts attribute numbers to bitmap correctly', () => {
      const fattr = nfs.Fattr([Nfsv4Attr.FATTR4_TYPE, Nfsv4Attr.FATTR4_SIZE], new Uint8Array());
      const bitmap = fattr.attrmask.mask;
      expect(bitmap[0] & (1 << Nfsv4Attr.FATTR4_TYPE)).toBeTruthy();
      expect(bitmap[0] & (1 << Nfsv4Attr.FATTR4_SIZE)).toBeTruthy();
    });
  });

  describe('clientId', () => {
    it('creates clientId', () => {
      const verifier = nfs.Verifier();
      const id = new Uint8Array([1, 2, 3, 4]);
      const clientId = nfs.ClientId(verifier, id);
      expect(clientId).toBeInstanceOf(structs.Nfsv4ClientId);
      expect(clientId.verifier).toBe(verifier);
      expect(clientId.id).toBe(id);
    });
  });

  describe('cbClient', () => {
    it('creates cbClient', () => {
      const cbClient = nfs.CbClient(0x40000000, 'tcp', '127.0.0.1.8.1');
      expect(cbClient).toBeInstanceOf(structs.Nfsv4CbClient);
      expect(cbClient.cbProgram).toBe(0x40000000);
      expect(cbClient.cbLocation).toBeInstanceOf(structs.Nfsv4ClientAddr);
    });
  });

  describe('bitmap', () => {
    it('creates bitmap from attribute numbers', () => {
      const bitmap = nfs.Bitmap([Nfsv4Attr.FATTR4_TYPE, Nfsv4Attr.FATTR4_SIZE, Nfsv4Attr.FATTR4_FILEID]);
      expect(bitmap).toBeInstanceOf(structs.Nfsv4Bitmap);
      expect(bitmap.mask[0] & (1 << Nfsv4Attr.FATTR4_TYPE)).toBeTruthy();
      expect(bitmap.mask[0] & (1 << Nfsv4Attr.FATTR4_SIZE)).toBeTruthy();
      expect(bitmap.mask[0] & (1 << Nfsv4Attr.FATTR4_FILEID)).toBeTruthy();
    });

    it('handles attributes spanning multiple words', () => {
      const bitmap = nfs.Bitmap([Nfsv4Attr.FATTR4_TYPE, 32, 64]);
      expect(bitmap.mask).toHaveLength(3);
      expect(bitmap.mask[0] & (1 << Nfsv4Attr.FATTR4_TYPE)).toBeTruthy();
      expect(bitmap.mask[1] & (1 << 0)).toBeTruthy();
      expect(bitmap.mask[2] & (1 << 0)).toBeTruthy();
    });
  });
});
