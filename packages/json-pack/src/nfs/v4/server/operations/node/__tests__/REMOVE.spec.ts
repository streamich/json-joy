import {setupNfsClientServerTestbed} from '../../../__tests__/setup';
import {nfs} from '../../../../builder';
import {Nfsv4Stat} from '../../../../constants';
import type * as msg from '../../../../messages';

describe('REMOVE operation', () => {
  test('remove a file succeeds', async () => {
    const {client, stop, vol} = await setupNfsClientServerTestbed();
    // create a temp file
    vol.writeFileSync('/export/todelete.txt', 'temporary');
    const res = await client.compound([nfs.PUTROOTFH(), nfs.REMOVE('todelete.txt')]);
    expect(res.status).toBe(Nfsv4Stat.NFS4_OK);
    await stop();
  });

  test('remove non-existent returns error', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const res = await client.compound([nfs.PUTROOTFH(), nfs.REMOVE('nope.txt')]);
    expect(res.status).not.toBe(Nfsv4Stat.NFS4_OK);
    await stop();
  });

  describe('change_info semantics', () => {
    test('returns before < after on successful remove', async () => {
      const {client, stop, vol} = await setupNfsClientServerTestbed();
      vol.writeFileSync('/export/test.txt', 'data');
      const res = await client.compound([nfs.PUTROOTFH(), nfs.REMOVE('test.txt')]);
      expect(res.status).toBe(Nfsv4Stat.NFS4_OK);
      const removeRes = res.resarray[1] as msg.Nfsv4RemoveResponse;
      expect(removeRes.status).toBe(Nfsv4Stat.NFS4_OK);
      if (removeRes.status === Nfsv4Stat.NFS4_OK && removeRes.resok) {
        const cinfo = removeRes.resok.cinfo;
        expect(cinfo.atomic).toBe(true);
        expect(cinfo.after).toBeGreaterThan(cinfo.before);
        expect(cinfo.after - cinfo.before).toBe(1n);
      }
      await stop();
    });

    test('change counter increments across multiple removes', async () => {
      const {client, stop, vol} = await setupNfsClientServerTestbed();
      vol.writeFileSync('/export/file1.txt', 'data1');
      vol.writeFileSync('/export/file2.txt', 'data2');
      const res1 = await client.compound([nfs.PUTROOTFH(), nfs.REMOVE('file1.txt')]);
      expect(res1.status).toBe(Nfsv4Stat.NFS4_OK);
      const removeRes1 = res1.resarray[1] as msg.Nfsv4RemoveResponse;
      const res2 = await client.compound([nfs.PUTROOTFH(), nfs.REMOVE('file2.txt')]);
      expect(res2.status).toBe(Nfsv4Stat.NFS4_OK);
      const removeRes2 = res2.resarray[1] as msg.Nfsv4RemoveResponse;
      if (
        removeRes1.status === Nfsv4Stat.NFS4_OK &&
        removeRes1.resok &&
        removeRes2.status === Nfsv4Stat.NFS4_OK &&
        removeRes2.resok
      ) {
        expect(removeRes2.resok.cinfo.after).toBeGreaterThan(removeRes1.resok.cinfo.after);
        expect(removeRes2.resok.cinfo.before).toBe(removeRes1.resok.cinfo.after);
      }
      await stop();
    });

    test('failed remove does not increment change counter', async () => {
      const {client, stop, vol} = await setupNfsClientServerTestbed();
      vol.writeFileSync('/export/existing.txt', 'data');
      const res1 = await client.compound([nfs.PUTROOTFH(), nfs.REMOVE('existing.txt')]);
      expect(res1.status).toBe(Nfsv4Stat.NFS4_OK);
      const removeRes1 = res1.resarray[1] as msg.Nfsv4RemoveResponse;
      const res2 = await client.compound([nfs.PUTROOTFH(), nfs.REMOVE('nonexistent.txt')]);
      expect(res2.status).not.toBe(Nfsv4Stat.NFS4_OK);
      vol.writeFileSync('/export/another.txt', 'data');
      const res3 = await client.compound([nfs.PUTROOTFH(), nfs.REMOVE('another.txt')]);
      expect(res3.status).toBe(Nfsv4Stat.NFS4_OK);
      const removeRes3 = res3.resarray[1] as msg.Nfsv4RemoveResponse;
      if (
        removeRes1.status === Nfsv4Stat.NFS4_OK &&
        removeRes1.resok &&
        removeRes3.status === Nfsv4Stat.NFS4_OK &&
        removeRes3.resok
      ) {
        expect(removeRes3.resok.cinfo.after - removeRes1.resok.cinfo.after).toBe(1n);
      }
      await stop();
    });
  });
});
