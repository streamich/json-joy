import {setupNfsClientServerTestbed} from '../../../__tests__/setup';
import {nfs} from '../../../../builder';
import {Nfsv4Stat, Nfsv4Attr} from '../../../../constants';
import type * as msg from '../../../../messages';
import {Writer} from '@jsonjoy.com/buffers/lib/Writer';
import {XdrEncoder} from '../../../../../../xdr/XdrEncoder';

describe('SETATTR operation', () => {
  test('set file mode (chmod) successfully', async () => {
    const {client, stop, vol} = await setupNfsClientServerTestbed();

    // Encode MODE attribute with value 0o644
    const writer = new Writer(32);
    const xdr = new XdrEncoder(writer);
    xdr.writeUnsignedInt(0o644); // mode value
    const attrVals = writer.flush();

    const attrs = nfs.Fattr([Nfsv4Attr.FATTR4_MODE], attrVals);
    const stateid = nfs.Stateid(0, new Uint8Array(12));
    const setattrReq = nfs.SETATTR(stateid, attrs);

    const r = await client.compound([nfs.PUTROOTFH(), nfs.LOOKUP('file.txt'), setattrReq]);
    const setattrRes = r.resarray[2] as msg.Nfsv4SetattrResponse;
    expect(setattrRes.status).toBe(Nfsv4Stat.NFS4_OK);

    // verify mode was set
    const stat = vol.statSync('/export/file.txt');
    expect(stat.mode & 0o777).toBe(0o644);

    await stop();
  });

  test('set file size (truncate) successfully', async () => {
    const {client, stop, vol} = await setupNfsClientServerTestbed();

    // Encode SIZE attribute with value 5
    const writer = new Writer(32);
    const xdr = new XdrEncoder(writer);
    xdr.writeUnsignedHyper(BigInt(5)); // size value
    const attrVals = writer.flush();

    const attrs = nfs.Fattr([Nfsv4Attr.FATTR4_SIZE], attrVals);
    const stateid = nfs.Stateid(0, new Uint8Array(12));
    const setattrReq = nfs.SETATTR(stateid, attrs);

    const r = await client.compound([nfs.PUTROOTFH(), nfs.LOOKUP('file.txt'), setattrReq]);
    const setattrRes = r.resarray[2] as msg.Nfsv4SetattrResponse;
    expect(setattrRes.status).toBe(Nfsv4Stat.NFS4_OK);

    // verify size was set
    const stat = vol.statSync('/export/file.txt');
    expect(stat.size).toBe(5);

    await stop();
  });

  test('setattr without file handle returns error', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();

    const writer = new Writer(32);
    const xdr = new XdrEncoder(writer);
    xdr.writeUnsignedInt(0o644);
    const attrVals = writer.flush();

    const attrs = nfs.Fattr([Nfsv4Attr.FATTR4_MODE], attrVals);
    const stateid = nfs.Stateid(0, new Uint8Array(12));
    const setattrReq = nfs.SETATTR(stateid, attrs);

    const r = await client.compound([setattrReq]);
    expect(r.status).not.toBe(Nfsv4Stat.NFS4_OK);

    await stop();
  });

  test('setattr with unsupported attribute returns error', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    // Use an unsupported attribute number
    const writer = new Writer(32);
    const xdr = new XdrEncoder(writer);
    xdr.writeUnsignedInt(12345); // bogus value
    const attrVals = writer.flush();
    const attrs = nfs.Fattr([99], attrVals); // unsupported attr num
    const stateid = nfs.Stateid(0, new Uint8Array(12));
    const setattrReq = nfs.SETATTR(stateid, attrs);
    const r = await client.compound([nfs.PUTROOTFH(), nfs.LOOKUP('file.txt'), setattrReq]);
    const setattrRes = r.resarray[2] as msg.Nfsv4SetattrResponse;
    expect(setattrRes.status).toBe(Nfsv4Stat.NFS4ERR_ATTRNOTSUPP);
    await stop();
  });
});
