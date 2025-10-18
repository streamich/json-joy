import {setupNfsClientServerTestbed} from '../../../__tests__/setup';
import {nfs} from '../../../../builder';
import {Nfsv4Stat} from '../../../../constants';
import type * as msg from '../../../../messages';

describe('CREATE operation', () => {
  test('create a new file successfully', async () => {
    const {client, stop, vol} = await setupNfsClientServerTestbed();
    const objtype = nfs.CreateTypeFile();
    const createattrs = nfs.Fattr([], new Uint8Array(0));
    const createReq = nfs.CREATE(objtype, 'newfile.txt', createattrs);
    const r = await client.compound([nfs.PUTROOTFH(), createReq]);
    const createRes = r.resarray[1] as msg.Nfsv4CreateResponse;
    expect(createRes.status).toBe(Nfsv4Stat.NFS4_OK);
    const exists = vol.existsSync('/export/newfile.txt');
    expect(exists).toBe(true);
    await stop();
  });

  test('create with existing file returns error', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const objtype = nfs.CreateTypeFile();
    const createattrs = nfs.Fattr([], new Uint8Array(0));
    const createReq = nfs.CREATE(objtype, 'file.txt', createattrs);
    const r = await client.compound([nfs.PUTROOTFH(), createReq]);
    const createRes = r.resarray[1] as msg.Nfsv4CreateResponse;
    expect(createRes.status).not.toBe(Nfsv4Stat.NFS4_OK);
    expect(createRes.status).toBe(Nfsv4Stat.NFS4ERR_EXIST);
    await stop();
  });

  test('create without file handle returns error', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const objtype = nfs.CreateTypeFile();
    const createattrs = nfs.Fattr([], new Uint8Array(0));
    const createReq = nfs.CREATE(objtype, 'test.txt', createattrs);
    const r = await client.compound([createReq]);
    expect(r.status).not.toBe(Nfsv4Stat.NFS4_OK);
    await stop();
  });
});
