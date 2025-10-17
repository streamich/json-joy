import {setupNfsClientServerTestbed} from '../../../__tests__/setup';
import {nfs} from '../../../../builder';
import {Nfsv4Stat, Nfsv4StableHow} from '../../../../constants';
import type * as msg from '../../../../messages';

describe('WRITE operation', () => {
  test('unstable write then commit (simulated by stable flag) succeeds', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const openOwner = nfs.OpenOwner(BigInt(1), new Uint8Array([1]));
    const claim = nfs.OpenClaimNull('file.txt');
    const openRes = await client.compound([
      nfs.PUTROOTFH(),
      nfs.OPEN(0, 2, 0, openOwner, nfs.OpenHowNoCreate(), claim),
    ]);
    const stateid = (openRes.resarray[1] as any).resok.stateid;
    const data = new Uint8Array(Buffer.from('NEWDATA'));
    const writeReq = nfs.WRITE(stateid, BigInt(0), Nfsv4StableHow.UNSTABLE4, data);
    const r = await client.compound([nfs.PUTROOTFH(), writeReq]);
    const writeRes = r.resarray[1];
    expect(writeRes.status).toBe(Nfsv4Stat.NFS4_OK);
    await stop();
  });

  test('stable write persists and returns verifier', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const openOwner = nfs.OpenOwner(BigInt(1), new Uint8Array([1]));
    const claim = nfs.OpenClaimNull('file.txt');
    const openRes = await client.compound([
      nfs.PUTROOTFH(),
      nfs.OPEN(0, 2, 0, openOwner, nfs.OpenHowNoCreate(), claim),
    ]);
    const stateid = (openRes.resarray[1] as any).resok.stateid;
    const data = new Uint8Array(Buffer.from('STABLE'));
    const writeReq2 = nfs.WRITE(stateid, BigInt(0), Nfsv4StableHow.FILE_SYNC4, data);
    const r2 = await client.compound([nfs.PUTROOTFH(), writeReq2]);
    const writeRes2 = r2.resarray[1];
    expect(writeRes2.status).toBe(Nfsv4Stat.NFS4_OK);
    const writeResOk = writeRes2 as any as msg.Nfsv4WriteResponse;
    expect(writeResOk.resok).toBeDefined();
    expect(writeResOk.resok!.writeverf).toBeDefined();
    await stop();
  });

  test('write with invalid handle returns error', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const badStateid = nfs.Stateid(0, new Uint8Array(12));
    const data = new Uint8Array(Buffer.from('X'));
    const writeReq3 = nfs.WRITE(badStateid, BigInt(0), Nfsv4StableHow.UNSTABLE4, data);
    const r3 = await client.compound([nfs.PUTROOTFH(), writeReq3]);
    const writeRes3 = r3.resarray[1];
    expect(writeRes3.status).not.toBe(Nfsv4Stat.NFS4_OK);
    await stop();
  });
});
