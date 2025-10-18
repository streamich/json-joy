import {setupNfsClientServerTestbed} from '../../../__tests__/setup';
import {nfs} from '../../../../builder';
import {Nfsv4Stat, Nfsv4StableHow} from '../../../../constants';
import type * as msg from '../../../../messages';

describe('COMMIT operation', () => {
  test('commit succeeds after write', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const openOwner = nfs.OpenOwner(BigInt(1), new Uint8Array([1]));
    const claim = nfs.OpenClaimNull('file.txt');
    const openRes = await client.compound([
      nfs.PUTROOTFH(),
      nfs.OPEN(0, 2, 0, openOwner, nfs.OpenHowNoCreate(), claim),
    ]);
    const stateid = (openRes.resarray[1] as any).resok.stateid;
    const data = new Uint8Array(Buffer.from('COMMITTED'));
    const writeReq = nfs.WRITE(stateid, BigInt(0), Nfsv4StableHow.UNSTABLE4, data);
    const writeRes = await client.compound([nfs.PUTROOTFH(), writeReq]);
    expect(writeRes.status).toBe(Nfsv4Stat.NFS4_OK);
    const commitReq = nfs.COMMIT(BigInt(0), 100);
    const r = await client.compound([nfs.PUTROOTFH(), nfs.LOOKUP('file.txt'), commitReq]);
    const commitRes = r.resarray[2] as msg.Nfsv4CommitResponse;
    expect(commitRes.status).toBe(Nfsv4Stat.NFS4_OK);
    await stop();
  });

  test('commit with invalid path returns error', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const commitReq = nfs.COMMIT(BigInt(0), 100);
    const r = await client.compound([nfs.PUTROOTFH(), nfs.LOOKUP('nonexistent.txt'), commitReq]);
    expect(r.status).not.toBe(Nfsv4Stat.NFS4_OK);
    await stop();
  });

  test('commit without file handle returns error', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const commitReq = nfs.COMMIT(BigInt(0), 100);
    const r = await client.compound([commitReq]);
    expect(r.status).not.toBe(Nfsv4Stat.NFS4_OK);
    await stop();
  });
});
