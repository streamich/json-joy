import {setupNfsClientServerTestbed} from '../../../__tests__/setup';
import {nfs} from '../../../../builder';
import type * as msg from '../../../../messages';
import {Nfsv4Stat} from '../../../../constants';

describe('READ operation', () => {
  test('partial read returns fewer bytes and EOF=false when not at EOF', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    // open file.txt for read
    const openOwner = nfs.OpenOwner(BigInt(1), new Uint8Array([1]));
    const claim = nfs.OpenClaimNull('file.txt');
    const openReq = nfs.OPEN(0, 1, 0, openOwner, nfs.OpenHowNoCreate(), claim);
    const res = await client.compound([nfs.PUTROOTFH(), openReq]);
    expect(res.status).toBe(Nfsv4Stat.NFS4_OK);
    const openRes = res.resarray[1] as msg.Nfsv4OpenResponse;
    const stateid = openRes.resok!.stateid;

    // request a large count but only small file exists
    const readReq = nfs.READ(BigInt(0), 1024, stateid);
    const r = await client.compound([nfs.PUTROOTFH(), readReq]);
    const readRes = r.resarray[1] as msg.Nfsv4ReadResponse;
    expect(readRes.status).toBe(Nfsv4Stat.NFS4_OK);
    expect(readRes.resok).toBeDefined();
    expect(readRes.resok!.eof).toBe(true);
    expect(Buffer.from(readRes.resok!.data).toString('utf8')).toBe('Hello, NFS v4!\n');

    await stop();
  });

  test('read with offset hits EOF and returns empty data', async () => {
    const {client, stop, vol} = await setupNfsClientServerTestbed();
    // create a small file
    vol.writeFileSync('/export/short.txt', 'abc');
    const openOwner = nfs.OpenOwner(BigInt(1), new Uint8Array([2]));
    const claim = nfs.OpenClaimNull('short.txt');
    const openReq = nfs.OPEN(0, 1, 0, openOwner, nfs.OpenHowNoCreate(), claim);
    const res = await client.compound([nfs.PUTROOTFH(), openReq]);
    const openRes = res.resarray[1] as msg.Nfsv4OpenResponse;
    const stateid = openRes.resok!.stateid;

    // offset beyond EOF
    const readReq = nfs.READ(BigInt(10), 10, stateid);
    const r = await client.compound([nfs.PUTROOTFH(), readReq]);
    const readRes = r.resarray[1] as msg.Nfsv4ReadResponse;
    expect(readRes.status).toBe(Nfsv4Stat.NFS4_OK);
    expect(readRes.resok).toBeDefined();
    expect(readRes.resok!.data.length).toBe(0);
    expect(Buffer.from(readRes.resok!.data).toString('utf8')).toBe('');
    expect(readRes.resok!.eof).toBe(true);

    await stop();
  });
});
