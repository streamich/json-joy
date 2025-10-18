import {Reader} from '@jsonjoy.com/buffers/lib/Reader';
import * as msg from '../messages';
import * as structs from '../structs';
import {Nfsv4Encoder} from '../Nfsv4Encoder';
import {Nfsv4Decoder} from '../Nfsv4Decoder';
import {Nfsv4Stat} from '../constants';

// This file performs a round-trip encode/decode for every NFSv4 operation
// Each describe block covers one operation with a request and a response.

describe('roundtrip all NFSv4 operations', () => {
  const makeCodec = () => ({encoder: new Nfsv4Encoder(), decoder: new Nfsv4Decoder()});
  const encoder = new Nfsv4Encoder();
  const decoder = new Nfsv4Decoder();

  const _assertRoundtrip = (request: msg.Nfsv4CompoundRequest) => {
    const encoded = encoder.encodeCompound(request);
    const decoded = decoder.decodeCompound(new Reader(encoded), true) as msg.Nfsv4CompoundRequest;
    expect(decoded).toEqual(request);
  };

  describe('CLOSE', () => {
    it('request/response roundtrip', () => {
      const {encoder, decoder} = makeCodec();
      const stateid = new structs.Nfsv4Stateid(1, new Uint8Array(12).fill(1));
      const req = new msg.Nfsv4CloseRequest(10, stateid);
      const creq = new msg.Nfsv4CompoundRequest('', 0, [req]);
      const encoded = encoder.encodeCompound(creq);
      const decoded = decoder.decodeCompound(new Reader(encoded), true) as msg.Nfsv4CompoundRequest;
      expect(decoded.argarray[0]).toBeInstanceOf(msg.Nfsv4CloseRequest);

      const resok = new msg.Nfsv4CloseResOk(stateid);
      const res = new msg.Nfsv4CloseResponse(Nfsv4Stat.NFS4_OK, resok);
      const cres = new msg.Nfsv4CompoundResponse(Nfsv4Stat.NFS4_OK, '', [res]);
      const encodedRes = encoder.encodeCompound(cres, false);
      const decodedRes = decoder.decodeCompound(new Reader(encodedRes), false) as msg.Nfsv4CompoundResponse;
      expect(decodedRes.resarray[0]).toBeInstanceOf(msg.Nfsv4CloseResponse);
    });
  });

  describe('COMMIT', () => {
    it('request/response roundtrip', () => {
      const {encoder, decoder} = makeCodec();
      const req = new msg.Nfsv4CommitRequest(BigInt(42), 123);
      const creq = new msg.Nfsv4CompoundRequest('', 0, [req]);
      const encoded = encoder.encodeCompound(creq);
      const decoded = decoder.decodeCompound(new Reader(encoded), true) as msg.Nfsv4CompoundRequest;
      expect(decoded.argarray[0]).toBeInstanceOf(msg.Nfsv4CommitRequest);

      const verifier = new structs.Nfsv4Verifier(new Uint8Array(8).fill(2));
      const resok = new msg.Nfsv4CommitResOk(verifier);
      const res = new msg.Nfsv4CommitResponse(Nfsv4Stat.NFS4_OK, resok);
      const cres = new msg.Nfsv4CompoundResponse(Nfsv4Stat.NFS4_OK, '', [res]);
      const encodedRes = encoder.encodeCompound(cres);
      const decodedRes = decoder.decodeCompound(new Reader(encodedRes), false) as msg.Nfsv4CompoundResponse;
      expect(decodedRes.resarray[0]).toBeInstanceOf(msg.Nfsv4CommitResponse);
    });
  });

  describe('CREATE', () => {
    it('request/response roundtrip', () => {
      const {encoder, decoder} = makeCodec();
      const bitmap = new structs.Nfsv4Bitmap([1]);
      const fattr = new structs.Nfsv4Fattr(bitmap, new Uint8Array([0, 0, 0, 1]));
      const createType = new structs.Nfsv4CreateType(1, new structs.Nfsv4CreateTypeVoid());
      const req = new msg.Nfsv4CreateRequest(createType, 'x.txt', fattr);
      const creq = new msg.Nfsv4CompoundRequest('', 0, [req]);
      const encoded = encoder.encodeCompound(creq);
      const decoded = decoder.decodeCompound(new Reader(encoded), true) as msg.Nfsv4CompoundRequest;
      expect(decoded.argarray[0]).toBeInstanceOf(msg.Nfsv4CreateRequest);

      const change = new structs.Nfsv4ChangeInfo(true, BigInt(1), BigInt(2));
      const bitmap2 = new structs.Nfsv4Bitmap([1]);
      const resok = new msg.Nfsv4CreateResOk(change, bitmap2);
      const res = new msg.Nfsv4CreateResponse(Nfsv4Stat.NFS4_OK, resok);
      const cres = new msg.Nfsv4CompoundResponse(Nfsv4Stat.NFS4_OK, '', [res]);
      const encodedRes = encoder.encodeCompound(cres, false);
      const decodedRes = decoder.decodeCompound(new Reader(encodedRes), false) as msg.Nfsv4CompoundResponse;
      expect(decodedRes.resarray[0]).toBeInstanceOf(msg.Nfsv4CreateResponse);
    });
  });

  describe('DELEGPURGE & DELEGRETURN', () => {
    it('DELEGPURGE roundtrip', () => {
      const {encoder, decoder} = makeCodec();
      const req = new msg.Nfsv4DelegpurgeRequest(BigInt(123));
      const creq = new msg.Nfsv4CompoundRequest('', 0, [req]);
      const encoded = encoder.encodeCompound(creq, true);
      const decoded = decoder.decodeCompound(new Reader(encoded), true) as msg.Nfsv4CompoundRequest;
      expect(decoded.argarray[0]).toBeInstanceOf(msg.Nfsv4DelegpurgeRequest);

      const res = new msg.Nfsv4DelegpurgeResponse(Nfsv4Stat.NFS4_OK);
      const cres = new msg.Nfsv4CompoundResponse(Nfsv4Stat.NFS4_OK, '', [res]);
      const encodedRes = encoder.encodeCompound(cres, false);
      const decodedRes = decoder.decodeCompound(new Reader(encodedRes), false) as msg.Nfsv4CompoundResponse;
      expect(decodedRes.resarray[0]).toBeInstanceOf(msg.Nfsv4DelegpurgeResponse);
    });

    it('DELEGRETURN roundtrip', () => {
      const {encoder, decoder} = makeCodec();
      const stateid = new structs.Nfsv4Stateid(5, new Uint8Array(12).fill(5));
      const req = new msg.Nfsv4DelegreturnRequest(stateid);
      const creq = new msg.Nfsv4CompoundRequest('', 0, [req]);
      const encoded = encoder.encodeCompound(creq, true);
      const decoded = decoder.decodeCompound(new Reader(encoded), true) as msg.Nfsv4CompoundRequest;
      expect(decoded.argarray[0]).toBeInstanceOf(msg.Nfsv4DelegreturnRequest);

      const res = new msg.Nfsv4DelegreturnResponse(Nfsv4Stat.NFS4_OK);
      const cres = new msg.Nfsv4CompoundResponse(Nfsv4Stat.NFS4_OK, '', [res]);
      const encodedRes = encoder.encodeCompound(cres, false);
      const decodedRes = decoder.decodeCompound(new Reader(encodedRes), false) as msg.Nfsv4CompoundResponse;
      expect(decodedRes.resarray[0]).toBeInstanceOf(msg.Nfsv4DelegreturnResponse);
    });
  });

  describe('LINK', () => {
    it('roundtrip', () => {
      const {encoder, decoder} = makeCodec();
      const req = new msg.Nfsv4LinkRequest('ln');
      const creq = new msg.Nfsv4CompoundRequest('', 0, [req]);
      const encoded = encoder.encodeCompound(creq);
      const decoded = decoder.decodeCompound(new Reader(encoded), true) as msg.Nfsv4CompoundRequest;
      expect(decoded.argarray[0]).toBeInstanceOf(msg.Nfsv4LinkRequest);

      const change = new structs.Nfsv4ChangeInfo(true, BigInt(10), BigInt(11));
      const resok = new msg.Nfsv4LinkResOk(change);
      const res = new msg.Nfsv4LinkResponse(Nfsv4Stat.NFS4_OK, resok);
      const cres = new msg.Nfsv4CompoundResponse(Nfsv4Stat.NFS4_OK, '', [res]);
      const encodedRes = encoder.encodeCompound(cres, false);
      const decodedRes = decoder.decodeCompound(new Reader(encodedRes), false) as msg.Nfsv4CompoundResponse;
      expect(decodedRes.resarray[0]).toBeInstanceOf(msg.Nfsv4LinkResponse);
    });
  });

  describe('LOCK/LOCKT/LOCKU', () => {
    it('LOCK request/response', () => {
      const {encoder, decoder} = makeCodec();
      const ownerInfo = new structs.Nfsv4LockOwnerInfo(
        false,
        new structs.Nfsv4LockExistingOwner(new structs.Nfsv4Stateid(1, new Uint8Array(12).fill(1)), 1),
      );
      const req = new msg.Nfsv4LockRequest(1, false, BigInt(0), BigInt(10), ownerInfo);
      const creq = new msg.Nfsv4CompoundRequest('', 0, [req]);
      const encoded = encoder.encodeCompound(creq, true);
      const decoded = decoder.decodeCompound(new Reader(encoded), true) as msg.Nfsv4CompoundRequest;
      expect(decoded.argarray[0]).toBeInstanceOf(msg.Nfsv4LockRequest);

      const lockStateid = new structs.Nfsv4Stateid(2, new Uint8Array(12).fill(2));
      const resok = new msg.Nfsv4LockResOk(lockStateid);
      const res = new msg.Nfsv4LockResponse(Nfsv4Stat.NFS4_OK, resok);
      const cres = new msg.Nfsv4CompoundResponse(Nfsv4Stat.NFS4_OK, '', [res]);
      const encodedRes = encoder.encodeCompound(cres, false);
      const decodedRes = decoder.decodeCompound(new Reader(encodedRes), false) as msg.Nfsv4CompoundResponse;
      expect(decodedRes.resarray[0]).toBeInstanceOf(msg.Nfsv4LockResponse);
    });

    it('LOCKT/LOCKU roundtrip', () => {
      const {encoder, decoder} = makeCodec();
      const owner = new structs.Nfsv4LockOwner(BigInt(3), new Uint8Array([3]));
      const lockt = new msg.Nfsv4LocktRequest(1, BigInt(0), BigInt(1), owner);
      const creq = new msg.Nfsv4CompoundRequest('', 0, [lockt]);
      const encoded = encoder.encodeCompound(creq, true);
      const decoded = decoder.decodeCompound(new Reader(encoded), true) as msg.Nfsv4CompoundRequest;
      expect(decoded.argarray[0]).toBeInstanceOf(msg.Nfsv4LocktRequest);

      const locku = new msg.Nfsv4LockuRequest(
        1,
        1,
        new structs.Nfsv4Stateid(3, new Uint8Array(12).fill(3)),
        BigInt(0),
        BigInt(1),
      );
      const creq2 = new msg.Nfsv4CompoundRequest('', 0, [locku]);
      const encoded2 = encoder.encodeCompound(creq2, true);
      const decoded2 = decoder.decodeCompound(new Reader(encoded2), true) as msg.Nfsv4CompoundRequest;
      expect(decoded2.argarray[0]).toBeInstanceOf(msg.Nfsv4LockuRequest);
    });
  });

  describe('LOOKUPP/PUTPUBFH/READDIR/READLINK', () => {
    it('LOOKUPP/PUTPUBFH roundtrip', () => {
      const {encoder, decoder} = makeCodec();
      const lookupp = new msg.Nfsv4LookuppRequest();
      const creq = new msg.Nfsv4CompoundRequest('', 0, [lookupp]);
      const encoded = encoder.encodeCompound(creq, true);
      const decoded = decoder.decodeCompound(new Reader(encoded), true) as msg.Nfsv4CompoundRequest;
      expect(decoded.argarray[0]).toBeInstanceOf(msg.Nfsv4LookuppRequest);

      const putpub = new msg.Nfsv4PutpubfhRequest();
      const creq2 = new msg.Nfsv4CompoundRequest('', 0, [putpub]);
      const encoded2 = encoder.encodeCompound(creq2, true);
      const decoded2 = decoder.decodeCompound(new Reader(encoded2), true) as msg.Nfsv4CompoundRequest;
      expect(decoded2.argarray[0]).toBeInstanceOf(msg.Nfsv4PutpubfhRequest);
    });

    it('READDIR/READLINK roundtrip', () => {
      const {encoder, decoder} = makeCodec();
      const verifier = new structs.Nfsv4Verifier(new Uint8Array(8).fill(9));
      const readdir = new msg.Nfsv4ReaddirRequest(BigInt(0), verifier, 256, 512, new structs.Nfsv4Bitmap([1]));
      const creq = new msg.Nfsv4CompoundRequest('', 0, [readdir]);
      const encoded = encoder.encodeCompound(creq, true);
      const decoded = decoder.decodeCompound(new Reader(encoded), true) as msg.Nfsv4CompoundRequest;
      expect(decoded.argarray[0]).toBeInstanceOf(msg.Nfsv4ReaddirRequest);

      const readlink = new msg.Nfsv4ReadlinkRequest();
      const creq2 = new msg.Nfsv4CompoundRequest('', 0, [readlink]);
      const encoded2 = encoder.encodeCompound(creq2, true);
      const decoded2 = decoder.decodeCompound(new Reader(encoded2), true) as msg.Nfsv4CompoundRequest;
      expect(decoded2.argarray[0]).toBeInstanceOf(msg.Nfsv4ReadlinkRequest);
    });
  });

  describe('REMOVE/RENAME', () => {
    it('REMOVE roundtrip', () => {
      const {encoder, decoder} = makeCodec();
      const req = new msg.Nfsv4RemoveRequest('rmme');
      const creq = new msg.Nfsv4CompoundRequest('', 0, [req]);
      const encoded = encoder.encodeCompound(creq, true);
      const decoded = decoder.decodeCompound(new Reader(encoded), true) as msg.Nfsv4CompoundRequest;
      expect(decoded.argarray[0]).toBeInstanceOf(msg.Nfsv4RemoveRequest);

      const change = new structs.Nfsv4ChangeInfo(true, BigInt(6), BigInt(7));
      const resok = new msg.Nfsv4RemoveResOk(change);
      const res = new msg.Nfsv4RemoveResponse(Nfsv4Stat.NFS4_OK, resok);
      const cres = new msg.Nfsv4CompoundResponse(Nfsv4Stat.NFS4_OK, '', [res]);
      const encodedRes = encoder.encodeCompound(cres, false);
      const decodedRes = decoder.decodeCompound(new Reader(encodedRes), false) as msg.Nfsv4CompoundResponse;
      expect(decodedRes.resarray[0]).toBeInstanceOf(msg.Nfsv4RemoveResponse);
    });

    it('RENAME roundtrip', () => {
      const {encoder, decoder} = makeCodec();
      const req = new msg.Nfsv4RenameRequest('a', 'b');
      const creq = new msg.Nfsv4CompoundRequest('', 0, [req]);
      const encoded = encoder.encodeCompound(creq, true);
      const decoded = decoder.decodeCompound(new Reader(encoded), true) as msg.Nfsv4CompoundRequest;
      expect(decoded.argarray[0]).toBeInstanceOf(msg.Nfsv4RenameRequest);

      const src = new structs.Nfsv4ChangeInfo(true, BigInt(1), BigInt(2));
      const tgt = new structs.Nfsv4ChangeInfo(true, BigInt(3), BigInt(4));
      const resok = new msg.Nfsv4RenameResOk(src, tgt);
      const res = new msg.Nfsv4RenameResponse(Nfsv4Stat.NFS4_OK, resok);
      const cres = new msg.Nfsv4CompoundResponse(Nfsv4Stat.NFS4_OK, '', [res]);
      const encodedRes = encoder.encodeCompound(cres, false);
      const decodedRes = decoder.decodeCompound(new Reader(encodedRes), false) as msg.Nfsv4CompoundResponse;
      expect(decodedRes.resarray[0]).toBeInstanceOf(msg.Nfsv4RenameResponse);
    });
  });

  describe('RENEW/RESTOREFH/SAVEFH', () => {
    it('RENEW', () => {
      const {encoder, decoder} = makeCodec();
      const req = new msg.Nfsv4RenewRequest(BigInt(555));
      const creq = new msg.Nfsv4CompoundRequest('', 0, [req]);
      const encoded = encoder.encodeCompound(creq, true);
      const decoded = decoder.decodeCompound(new Reader(encoded), true) as msg.Nfsv4CompoundRequest;
      expect(decoded.argarray[0]).toBeInstanceOf(msg.Nfsv4RenewRequest);

      const res = new msg.Nfsv4RenewResponse(Nfsv4Stat.NFS4_OK);
      const cres = new msg.Nfsv4CompoundResponse(Nfsv4Stat.NFS4_OK, '', [res]);
      const encodedRes = encoder.encodeCompound(cres, false);
      const decodedRes = decoder.decodeCompound(new Reader(encodedRes), false) as msg.Nfsv4CompoundResponse;
      expect(decodedRes.resarray[0]).toBeInstanceOf(msg.Nfsv4RenewResponse);
    });

    it('RESTOREFH/SAVEFH', () => {
      const {encoder, decoder} = makeCodec();
      const rreq = new msg.Nfsv4RestorefhRequest();
      const sreq = new msg.Nfsv4SavefhRequest();
      const creq = new msg.Nfsv4CompoundRequest('', 0, [rreq, sreq]);
      const encoded = encoder.encodeCompound(creq, true);
      const decoded = decoder.decodeCompound(new Reader(encoded), true) as msg.Nfsv4CompoundRequest;
      expect(decoded.argarray[0]).toBeInstanceOf(msg.Nfsv4RestorefhRequest);
      expect(decoded.argarray[1]).toBeInstanceOf(msg.Nfsv4SavefhRequest);

      const rres = new msg.Nfsv4RestorefhResponse(Nfsv4Stat.NFS4_OK);
      const sres = new msg.Nfsv4SavefhResponse(Nfsv4Stat.NFS4_OK);
      const cres = new msg.Nfsv4CompoundResponse(Nfsv4Stat.NFS4_OK, '', [rres, sres]);
      const encodedRes = encoder.encodeCompound(cres, false);
      const decodedRes = decoder.decodeCompound(new Reader(encodedRes), false) as msg.Nfsv4CompoundResponse;
      expect(decodedRes.resarray[0]).toBeInstanceOf(msg.Nfsv4RestorefhResponse);
      expect(decodedRes.resarray[1]).toBeInstanceOf(msg.Nfsv4SavefhResponse);
    });
  });

  describe('SECINFO/SETATTR/VERIFY/NVERIFY', () => {
    it('SECINFO roundtrip', () => {
      const {encoder, decoder} = makeCodec();
      const req = new msg.Nfsv4SecinfoRequest('s');
      const creq = new msg.Nfsv4CompoundRequest('', 0, [req]);
      const encoded = encoder.encodeCompound(creq, true);
      const decoded = decoder.decodeCompound(new Reader(encoded), true) as msg.Nfsv4CompoundRequest;
      expect(decoded.argarray[0]).toBeInstanceOf(msg.Nfsv4SecinfoRequest);

      const resok = new msg.Nfsv4SecinfoResOk([]);
      const res = new msg.Nfsv4SecinfoResponse(Nfsv4Stat.NFS4_OK, resok);
      const cres = new msg.Nfsv4CompoundResponse(Nfsv4Stat.NFS4_OK, '', [res]);
      const encodedRes = encoder.encodeCompound(cres, false);
      const decodedRes = decoder.decodeCompound(new Reader(encodedRes), false) as msg.Nfsv4CompoundResponse;
      expect(decodedRes.resarray[0]).toBeInstanceOf(msg.Nfsv4SecinfoResponse);
    });

    it('SETATTR/VERIFY/NVERIFY roundtrip', () => {
      const {encoder, decoder} = makeCodec();
      const stateid = new structs.Nfsv4Stateid(7, new Uint8Array(12).fill(7));
      const bitmap = new structs.Nfsv4Bitmap([1]);
      const fattr = new structs.Nfsv4Fattr(bitmap, new Uint8Array([0, 0, 0, 1]));
      const setattr = new msg.Nfsv4SetattrRequest(stateid, fattr);
      const creq = new msg.Nfsv4CompoundRequest('', 0, [setattr]);
      const encoded = encoder.encodeCompound(creq, true);
      const decoded = decoder.decodeCompound(new Reader(encoded), true) as msg.Nfsv4CompoundRequest;
      expect(decoded.argarray[0]).toBeInstanceOf(msg.Nfsv4SetattrRequest);

      const resok = new msg.Nfsv4SetattrResOk(bitmap);
      const sres = new msg.Nfsv4SetattrResponse(Nfsv4Stat.NFS4_OK, resok);
      const cres = new msg.Nfsv4CompoundResponse(Nfsv4Stat.NFS4_OK, '', [sres]);
      const encodedRes = encoder.encodeCompound(cres, false);
      const decodedRes = decoder.decodeCompound(new Reader(encodedRes), false) as msg.Nfsv4CompoundResponse;
      expect(decodedRes.resarray[0]).toBeInstanceOf(msg.Nfsv4SetattrResponse);

      const vreq = new msg.Nfsv4VerifyRequest(fattr);
      const creq2 = new msg.Nfsv4CompoundRequest('', 0, [vreq]);
      const encoded2 = encoder.encodeCompound(creq2, true);
      const decoded2 = decoder.decodeCompound(new Reader(encoded2), true) as msg.Nfsv4CompoundRequest;
      expect(decoded2.argarray[0]).toBeInstanceOf(msg.Nfsv4VerifyRequest);

      const nvreq = new msg.Nfsv4NverifyRequest(fattr);
      const creq3 = new msg.Nfsv4CompoundRequest('', 0, [nvreq]);
      const encoded3 = encoder.encodeCompound(creq3, true);
      const decoded3 = decoder.decodeCompound(new Reader(encoded3), true) as msg.Nfsv4CompoundRequest;
      expect(decoded3.argarray[0]).toBeInstanceOf(msg.Nfsv4NverifyRequest);
    });
  });

  describe('OPEN/OPENATTR/OPEN_CONFIRM/OPEN_DOWNGRADE', () => {
    it('OPEN roundtrip', () => {
      const {encoder, decoder} = makeCodec();
      const owner = new structs.Nfsv4OpenOwner(BigInt(11), new Uint8Array([11]));
      const claim = new structs.Nfsv4OpenClaim(0, new structs.Nfsv4OpenClaimNull(''));
      const req = new msg.Nfsv4OpenRequest(1, 2, 3, owner, new structs.Nfsv4OpenHow(0), claim);
      const creq = new msg.Nfsv4CompoundRequest('', 0, [req]);
      const encoded = encoder.encodeCompound(creq, true);
      const decoded = decoder.decodeCompound(new Reader(encoded), true) as msg.Nfsv4CompoundRequest;
      expect(decoded.argarray[0]).toBeInstanceOf(msg.Nfsv4OpenRequest);

      const stateid = new structs.Nfsv4Stateid(12, new Uint8Array(12).fill(12));
      const change = new structs.Nfsv4ChangeInfo(true, BigInt(100), BigInt(101));
      const rflags = 0;
      const attrset = new structs.Nfsv4Bitmap([1]);
      const delegation = new structs.Nfsv4OpenDelegation(0);
      const resok = new msg.Nfsv4OpenResOk(stateid, change, rflags, attrset, delegation);
      const res = new msg.Nfsv4OpenResponse(Nfsv4Stat.NFS4_OK, resok);
      const cres = new msg.Nfsv4CompoundResponse(Nfsv4Stat.NFS4_OK, '', [res]);
      const encodedRes = encoder.encodeCompound(cres, false);
      const decodedRes = decoder.decodeCompound(new Reader(encodedRes), false) as msg.Nfsv4CompoundResponse;
      expect(decodedRes.resarray[0]).toBeInstanceOf(msg.Nfsv4OpenResponse);
    });

    it('OPENATTR/OPEN_CONFIRM/OPEN_DOWNGRADE roundtrip', () => {
      const {encoder, decoder} = makeCodec();
      const _owner = new structs.Nfsv4OpenOwner(BigInt(13), new Uint8Array([13]));
      const openattr = new msg.Nfsv4OpenattrRequest(false);
      const creq = new msg.Nfsv4CompoundRequest('', 0, [openattr]);
      const encoded = encoder.encodeCompound(creq, true);
      const decoded = decoder.decodeCompound(new Reader(encoded), true) as msg.Nfsv4CompoundRequest;
      expect(decoded.argarray[0]).toBeInstanceOf(msg.Nfsv4OpenattrRequest);

      const confirm = new msg.Nfsv4OpenConfirmRequest(new structs.Nfsv4Stateid(14, new Uint8Array(12).fill(14)), 1);
      const creq2 = new msg.Nfsv4CompoundRequest('', 0, [confirm]);
      const encoded2 = encoder.encodeCompound(creq2, true);
      const decoded2 = decoder.decodeCompound(new Reader(encoded2), true) as msg.Nfsv4CompoundRequest;
      expect(decoded2.argarray[0]).toBeInstanceOf(msg.Nfsv4OpenConfirmRequest);

      const downgrade = new msg.Nfsv4OpenDowngradeRequest(
        new structs.Nfsv4Stateid(15, new Uint8Array(12).fill(15)),
        1,
        0,
        0,
      );
      const creq3 = new msg.Nfsv4CompoundRequest('', 0, [downgrade]);
      const encoded3 = encoder.encodeCompound(creq3, true);
      const decoded3 = decoder.decodeCompound(new Reader(encoded3), true) as msg.Nfsv4CompoundRequest;
      expect(decoded3.argarray[0]).toBeInstanceOf(msg.Nfsv4OpenDowngradeRequest);
    });
  });

  describe('PUTFH/PUTROOTFH/GETFH/GETATTR', () => {
    it('PUTFH/PUTROOTFH/GETFH/GETATTR roundtrip', () => {
      const {encoder, decoder} = makeCodec();
      const putfh = new msg.Nfsv4PutfhRequest(new structs.Nfsv4Fh(new Uint8Array([1, 2, 3])));
      const prfh = new msg.Nfsv4PutrootfhRequest();
      const gfh = new msg.Nfsv4GetfhRequest();
      const bitmap = new structs.Nfsv4Bitmap([1]);
      const getattr = new msg.Nfsv4GetattrRequest(bitmap);
      const creq = new msg.Nfsv4CompoundRequest('', 0, [putfh, prfh, gfh, getattr]);
      const encoded = encoder.encodeCompound(creq, true);
      const decoded = decoder.decodeCompound(new Reader(encoded), true) as msg.Nfsv4CompoundRequest;
      expect(decoded.argarray[0]).toBeInstanceOf(msg.Nfsv4PutfhRequest);
      expect(decoded.argarray[3]).toBeInstanceOf(msg.Nfsv4GetattrRequest);
    });
  });

  describe('READ/WRITE', () => {
    it('READ/WRITE roundtrip', () => {
      const {encoder, decoder} = makeCodec();
      const readState = new structs.Nfsv4Stateid(21, new Uint8Array(12).fill(21));
      const read = new msg.Nfsv4ReadRequest(readState, BigInt(0), 512);
      const creq = new msg.Nfsv4CompoundRequest('', 0, [read]);
      const encoded = encoder.encodeCompound(creq, true);
      const decoded = decoder.decodeCompound(new Reader(encoded), true) as msg.Nfsv4CompoundRequest;
      expect(decoded.argarray[0]).toBeInstanceOf(msg.Nfsv4ReadRequest);

      const writeState = new structs.Nfsv4Stateid(22, new Uint8Array(12).fill(22));
      const write = new msg.Nfsv4WriteRequest(writeState, BigInt(0), 0, new Uint8Array([1, 2, 3]));
      const creq2 = new msg.Nfsv4CompoundRequest('', 0, [write]);
      const encoded2 = encoder.encodeCompound(creq2, true);
      const decoded2 = decoder.decodeCompound(new Reader(encoded2), true) as msg.Nfsv4CompoundRequest;
      expect(decoded2.argarray[0]).toBeInstanceOf(msg.Nfsv4WriteRequest);
    });
  });

  describe('SETCLIENTID and SETCLIENTID_CONFIRM', () => {
    it('SETCLIENTID roundtrip', () => {
      const {encoder, decoder} = makeCodec();
      const verifier = new structs.Nfsv4Verifier(new Uint8Array(8).fill(0xab));
      const clientId = new structs.Nfsv4ClientId(verifier, new Uint8Array([1, 2, 3]));
      const clientAddr = new structs.Nfsv4ClientAddr('tcp', '192.168.1.100.8.1');
      const cbClient = new structs.Nfsv4CbClient(0x40000000, clientAddr);
      const setclient = new msg.Nfsv4SetclientidRequest(clientId, cbClient, 12345);
      const creq = new msg.Nfsv4CompoundRequest('', 0, [setclient]);
      const encoded = encoder.encodeCompound(creq, true);
      const decoded = decoder.decodeCompound(new Reader(encoded), true) as msg.Nfsv4CompoundRequest;
      expect(decoded.argarray[0]).toBeInstanceOf(msg.Nfsv4SetclientidRequest);

      const setclientOk = new msg.Nfsv4SetclientidResOk(BigInt(1000), new structs.Nfsv4Verifier(new Uint8Array(8)));
      const res = new msg.Nfsv4SetclientidResponse(Nfsv4Stat.NFS4_OK, setclientOk);
      const cres = new msg.Nfsv4CompoundResponse(Nfsv4Stat.NFS4_OK, '', [res]);
      const encodedRes = encoder.encodeCompound(cres, false);
      const decodedRes = decoder.decodeCompound(new Reader(encodedRes), false) as msg.Nfsv4CompoundResponse;
      expect(decodedRes.resarray[0]).toBeInstanceOf(msg.Nfsv4SetclientidResponse);
    });

    it('SETCLIENTID_CONFIRM roundtrip', () => {
      const {encoder, decoder} = makeCodec();
      const confirm = new msg.Nfsv4SetclientidConfirmRequest(
        BigInt(1000),
        new structs.Nfsv4Verifier(new Uint8Array(8).fill(0x99)),
      );
      const creq = new msg.Nfsv4CompoundRequest('', 0, [confirm]);
      const encoded = encoder.encodeCompound(creq, true);
      const decoded = decoder.decodeCompound(new Reader(encoded), true) as msg.Nfsv4CompoundRequest;
      expect(decoded.argarray[0]).toBeInstanceOf(msg.Nfsv4SetclientidConfirmRequest);

      const res = new msg.Nfsv4SetclientidConfirmResponse(Nfsv4Stat.NFS4_OK);
      const cres = new msg.Nfsv4CompoundResponse(Nfsv4Stat.NFS4_OK, '', [res]);
      const encodedRes = encoder.encodeCompound(cres, false);
      const decodedRes = decoder.decodeCompound(new Reader(encodedRes), false) as msg.Nfsv4CompoundResponse;
      expect(decodedRes.resarray[0]).toBeInstanceOf(msg.Nfsv4SetclientidConfirmResponse);
    });
  });

  describe('RELEASE_LOCKOWNER/ILLEGAL', () => {
    it('RELEASE_LOCKOWNER roundtrip', () => {
      const {encoder, decoder} = makeCodec();
      const lockOwner = new structs.Nfsv4LockOwner(BigInt(9), new Uint8Array([9]));
      const req = new msg.Nfsv4ReleaseLockOwnerRequest(lockOwner);
      const creq = new msg.Nfsv4CompoundRequest('', 0, [req]);
      const encoded = encoder.encodeCompound(creq, true);
      const decoded = decoder.decodeCompound(new Reader(encoded), true) as msg.Nfsv4CompoundRequest;
      expect(decoded.argarray[0]).toBeInstanceOf(msg.Nfsv4ReleaseLockOwnerRequest);

      const res = new msg.Nfsv4ReleaseLockOwnerResponse(Nfsv4Stat.NFS4_OK);
      const cres = new msg.Nfsv4CompoundResponse(Nfsv4Stat.NFS4_OK, '', [res]);
      const encodedRes = encoder.encodeCompound(cres, false);
      const decodedRes = decoder.decodeCompound(new Reader(encodedRes), false) as msg.Nfsv4CompoundResponse;
      expect(decodedRes.resarray[0]).toBeInstanceOf(msg.Nfsv4ReleaseLockOwnerResponse);
    });

    it('ILLEGAL roundtrip', () => {
      const {encoder, decoder} = makeCodec();
      const req = new msg.Nfsv4IllegalRequest();
      const creq = new msg.Nfsv4CompoundRequest('', 0, [req]);
      const encoded = encoder.encodeCompound(creq, true);
      const decoded = decoder.decodeCompound(new Reader(encoded), true) as msg.Nfsv4CompoundRequest;
      expect(decoded.argarray[0]).toBeInstanceOf(msg.Nfsv4IllegalRequest);

      const res = new msg.Nfsv4IllegalResponse(Nfsv4Stat.NFS4ERR_OP_ILLEGAL);
      const cres = new msg.Nfsv4CompoundResponse(Nfsv4Stat.NFS4ERR_OP_ILLEGAL, '', [res]);
      const encodedRes = encoder.encodeCompound(cres, false);
      const decodedRes = decoder.decodeCompound(new Reader(encodedRes), false) as msg.Nfsv4CompoundResponse;
      expect(decodedRes.resarray[0]).toBeInstanceOf(msg.Nfsv4IllegalResponse);
    });
  });

  describe('Callbacks: CB_GETATTR/CB_RECALL/CB_ILLEGAL', () => {
    it('CB_GETATTR roundtrip', () => {
      const {encoder, decoder} = makeCodec();
      const bitmap = new structs.Nfsv4Bitmap([1]);
      const fh = new structs.Nfsv4Fh(new Uint8Array([7, 7, 7]));
      const req = new msg.Nfsv4CbGetattrRequest(fh, bitmap);
      const creq = new msg.Nfsv4CbCompoundRequest('', 0, 0, [req]);
      const encoded = encoder.encodeCbCompound(creq, true);
      const decoded = decoder.decodeCbCompound(new Reader(encoded), true) as msg.Nfsv4CbCompoundRequest;
      expect(decoded.argarray[0]).toBeInstanceOf(msg.Nfsv4CbGetattrRequest);

      const fattr = new structs.Nfsv4Fattr(bitmap, new Uint8Array([0, 0, 0, 1]));
      const resok = new msg.Nfsv4CbGetattrResOk(fattr);
      const res = new msg.Nfsv4CbGetattrResponse(Nfsv4Stat.NFS4_OK, resok);
      const cres = new msg.Nfsv4CbCompoundResponse(Nfsv4Stat.NFS4_OK, '', [res]);
      const encodedRes = encoder.encodeCbCompound(cres, false);
      const decodedRes = decoder.decodeCbCompound(new Reader(encodedRes), false) as msg.Nfsv4CbCompoundResponse;
      expect(decodedRes.resarray[0]).toBeInstanceOf(msg.Nfsv4CbGetattrResponse);
    });

    it('CB_RECALL roundtrip', () => {
      const {encoder, decoder} = makeCodec();
      const stateid = new structs.Nfsv4Stateid(99, new Uint8Array(12).fill(99));
      const fh2 = new structs.Nfsv4Fh(new Uint8Array([8, 8, 8]));
      const req = new msg.Nfsv4CbRecallRequest(stateid, false, fh2);
      const creq = new msg.Nfsv4CbCompoundRequest('', 0, 0, [req]);
      const encoded = encoder.encodeCbCompound(creq, true);
      const decoded = decoder.decodeCbCompound(new Reader(encoded), true) as msg.Nfsv4CbCompoundRequest;
      expect(decoded.argarray[0]).toBeInstanceOf(msg.Nfsv4CbRecallRequest);

      const res = new msg.Nfsv4CbRecallResponse(Nfsv4Stat.NFS4_OK);
      const cres = new msg.Nfsv4CbCompoundResponse(Nfsv4Stat.NFS4_OK, '', [res]);
      const encodedRes = encoder.encodeCbCompound(cres, false);
      const decodedRes = decoder.decodeCbCompound(new Reader(encodedRes), false) as msg.Nfsv4CbCompoundResponse;
      expect(decodedRes.resarray[0]).toBeInstanceOf(msg.Nfsv4CbRecallResponse);
    });

    it('CB_ILLEGAL roundtrip', () => {
      const {encoder, decoder} = makeCodec();
      const req = new msg.Nfsv4CbIllegalRequest();
      const creq = new msg.Nfsv4CbCompoundRequest('', 0, 0, [req]);
      const encoded = encoder.encodeCbCompound(creq, true);
      const decoded = decoder.decodeCbCompound(new Reader(encoded), true) as msg.Nfsv4CbCompoundRequest;
      expect(decoded.argarray[0]).toBeInstanceOf(msg.Nfsv4CbIllegalRequest);

      const res = new msg.Nfsv4CbIllegalResponse(Nfsv4Stat.NFS4ERR_OP_ILLEGAL);
      const cres = new msg.Nfsv4CbCompoundResponse(Nfsv4Stat.NFS4ERR_OP_ILLEGAL, '', [res]);
      const encodedRes = encoder.encodeCbCompound(cres, false);
      const decodedRes = decoder.decodeCbCompound(new Reader(encodedRes), false) as msg.Nfsv4CbCompoundResponse;
      expect(decodedRes.resarray[0]).toBeInstanceOf(msg.Nfsv4CbIllegalResponse);
    });
  });
});
