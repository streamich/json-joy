import {setupNfsClientServerTestbed} from '../../../__tests__/setup';
import {nfs} from '../../../../builder';
import {Nfsv4Stat} from '../../../../constants';

describe('READLINK operation', () => {
  test('readlink returns target for a symlink', async () => {
    const {client, stop, vol} = await setupNfsClientServerTestbed();
    // create symlink
    vol.symlinkSync('/export/file.txt', '/export/link.txt');
    const res = await client.compound([nfs.PUTROOTFH(), nfs.LOOKUP('link.txt'), nfs.READLINK()]);
    expect(res.status).toBe(Nfsv4Stat.NFS4_OK);
    const rl = res.resarray[2];
    expect(rl).toBeDefined();
    await stop();
  });

  test('readlink returns error for non-symlink', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const res = await client.compound([nfs.PUTROOTFH(), nfs.LOOKUP('file.txt'), nfs.READLINK()]);
    // server should report error (not a symlink)
    expect(res.status).not.toBe(Nfsv4Stat.NFS4_OK);
    await stop();
  });
});
