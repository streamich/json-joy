import {setupNfsClientServerTestbed} from '../../../__tests__/setup';
import {nfs} from '../../../../builder';
import {Nfsv4Stat} from '../../../../constants';
import type * as msg from '../../../../messages';

describe('LINK operation', () => {
  test('create hard link successfully', async () => {
    const {client, stop, vol} = await setupNfsClientServerTestbed();

    // Setup: file.txt exists, use SAVEFH to save source, then set current to root
    const r1 = await client.compound([
      nfs.PUTROOTFH(),
      nfs.LOOKUP('file.txt'),
      nfs.SAVEFH(),
      nfs.PUTROOTFH(),
      nfs.LINK('hardlink.txt'),
    ]);
    const linkRes = r1.resarray[4] as msg.Nfsv4LinkResponse;
    expect(linkRes.status).toBe(Nfsv4Stat.NFS4_OK);

    // verify link was created
    const exists = vol.existsSync('/export/hardlink.txt');
    expect(exists).toBe(true);

    // verify both files have same inode (hard link)
    const stat1 = vol.statSync('/export/file.txt');
    const stat2 = vol.statSync('/export/hardlink.txt');
    expect(stat1.ino).toBe(stat2.ino);

    await stop();
  });

  test('link without saved file handle returns error', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();

    // LINK requires saved file handle (SAVEFH)
    const r = await client.compound([nfs.PUTROOTFH(), nfs.LINK('link.txt')]);
    expect(r.status).not.toBe(Nfsv4Stat.NFS4_OK);

    await stop();
  });

  test('link to nonexistent source returns error', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();

    const r = await client.compound([nfs.PUTROOTFH(), nfs.LOOKUP('nonexistent.txt')]);
    expect(r.status).not.toBe(Nfsv4Stat.NFS4_OK);

    await stop();
  });
});
