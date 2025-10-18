import {setupNfsClientServerTestbed} from '../../../__tests__/setup';
import {nfs} from '../../../../builder';
import {Nfsv4Stat, Nfsv4Attr} from '../../../../constants';
import type * as msg from '../../../../messages';
import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import {XdrEncoder} from '../../../../../../xdr/XdrEncoder';

describe('NVERIFY operation', () => {
  test('nverify with mismatched attributes succeeds', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();

    // Encode SIZE attribute with incorrect value
    const writer = new Writer(32);
    const xdr = new XdrEncoder(writer);
    xdr.writeUnsignedHyper(BigInt(999999)); // wrong size
    const attrVals = writer.flush();

    const attrs = nfs.Fattr([Nfsv4Attr.FATTR4_SIZE], attrVals);
    const nverifyReq = nfs.NVERIFY(attrs);

    const r = await client.compound([nfs.PUTROOTFH(), nfs.LOOKUP('file.txt'), nverifyReq]);
    const nverifyRes = r.resarray[2] as msg.Nfsv4NverifyResponse;
    expect(nverifyRes.status).toBe(Nfsv4Stat.NFS4_OK);

    await stop();
  });

  test('nverify with matching attributes returns NOT_SAME', async () => {
    const {client, stop, vol} = await setupNfsClientServerTestbed();

    // Get current file size
    const stat = vol.statSync('/export/file.txt');
    const fileSize = BigInt(stat.size);

    // Encode SIZE attribute with correct value
    const writer = new Writer(32);
    const xdr = new XdrEncoder(writer);
    xdr.writeUnsignedHyper(fileSize);
    const attrVals = writer.flush();

    const attrs = nfs.Fattr([Nfsv4Attr.FATTR4_SIZE], attrVals);
    const nverifyReq = nfs.NVERIFY(attrs);

    const r = await client.compound([nfs.PUTROOTFH(), nfs.LOOKUP('file.txt'), nverifyReq]);
    const nverifyRes = r.resarray[2] as msg.Nfsv4NverifyResponse;
    expect(nverifyRes.status).toBe(Nfsv4Stat.NFS4ERR_NOT_SAME);

    await stop();
  });

  test('nverify without file handle returns error', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();

    const writer = new Writer(32);
    const xdr = new XdrEncoder(writer);
    xdr.writeUnsignedHyper(BigInt(100));
    const attrVals = writer.flush();

    const attrs = nfs.Fattr([Nfsv4Attr.FATTR4_SIZE], attrVals);
    const nverifyReq = nfs.NVERIFY(attrs);

    const r = await client.compound([nverifyReq]);
    expect(r.status).not.toBe(Nfsv4Stat.NFS4_OK);

    await stop();
  });
});
