import {setupNfsClientServerTestbed} from '../../../__tests__/setup';
import {nfs} from '../../../../builder';
import {Nfsv4Stat, Nfsv4Attr} from '../../../../constants';
import type * as msg from '../../../../messages';
import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import {XdrEncoder} from '../../../../../../xdr/XdrEncoder';

describe('VERIFY operation', () => {
  test('verify matching attributes succeeds', async () => {
    const {client, stop, vol} = await setupNfsClientServerTestbed();
    const stat = vol.statSync('/export/file.txt');
    const fileSize = BigInt(stat.size);
    const writer = new Writer(32);
    const xdr = new XdrEncoder(writer);
    xdr.writeUnsignedHyper(fileSize);
    const attrVals = writer.flush();
    const attrs = nfs.Fattr([Nfsv4Attr.FATTR4_SIZE], attrVals);
    const verifyReq = nfs.VERIFY(attrs);
    const r = await client.compound([nfs.PUTROOTFH(), nfs.LOOKUP('file.txt'), verifyReq]);
    const verifyRes = r.resarray[2] as msg.Nfsv4VerifyResponse;
    expect(verifyRes.status).toBe(Nfsv4Stat.NFS4_OK);
    await stop();
  });

  test('verify mismatched attributes returns NOT_SAME', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const writer = new Writer(32);
    const xdr = new XdrEncoder(writer);
    xdr.writeUnsignedHyper(BigInt(999999)); // wrong size
    const attrVals = writer.flush();
    const attrs = nfs.Fattr([Nfsv4Attr.FATTR4_SIZE], attrVals);
    const verifyReq = nfs.VERIFY(attrs);
    const r = await client.compound([nfs.PUTROOTFH(), nfs.LOOKUP('file.txt'), verifyReq]);
    const verifyRes = r.resarray[2] as msg.Nfsv4VerifyResponse;
    expect(verifyRes.status).toBe(Nfsv4Stat.NFS4ERR_NOT_SAME);
    await stop();
  });

  test('verify without file handle returns error', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const writer = new Writer(32);
    const xdr = new XdrEncoder(writer);
    xdr.writeUnsignedHyper(BigInt(100));
    const attrVals = writer.flush();
    const attrs = nfs.Fattr([Nfsv4Attr.FATTR4_SIZE], attrVals);
    const verifyReq = nfs.VERIFY(attrs);
    const r = await client.compound([verifyReq]);
    expect(r.status).not.toBe(Nfsv4Stat.NFS4_OK);
    await stop();
  });
});
