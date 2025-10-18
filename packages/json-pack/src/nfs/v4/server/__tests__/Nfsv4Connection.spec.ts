import {setupNfsClientServerTestbed} from './setup';
import * as msg from '../../messages';
import {Nfsv4Stat} from '../../constants';
import {nfs} from '../../builder';

describe('Nfsv4Connection with Nfsv4TcpClient over dual-Duplex', () => {
  test('NULL request returns success', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    expect(await client.null()).toBe(undefined);
    await stop();
  });

  test('PUTROOTFH + GETFH returns root filehandle', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const response = await client.compound([nfs.PUTROOTFH(), nfs.GETFH()]);
    expect(response.status).toBe(Nfsv4Stat.NFS4_OK);
    expect(response.resarray).toHaveLength(2);
    expect(response.resarray[0]).toBeInstanceOf(msg.Nfsv4PutrootfhResponse);
    expect(response.resarray[1]).toBeInstanceOf(msg.Nfsv4GetfhResponse);
    const getfhRes = response.resarray[1] as msg.Nfsv4GetfhResponse;
    expect(getfhRes.status).toBe(Nfsv4Stat.NFS4_OK);
    expect(getfhRes.resok).toBeDefined();
    expect(getfhRes.resok!.object.data).toBeDefined();
    await stop();
  });

  test('PUTROOTFH + LOOKUP + GETATTR returns file attributes', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const response = await client.compound([nfs.PUTROOTFH(), nfs.LOOKUP('file.txt'), nfs.GETATTR([0x00000001])]);
    expect(response.status).toBe(Nfsv4Stat.NFS4_OK);
    expect(response.resarray).toHaveLength(3);
    const lookupRes = response.resarray[1] as msg.Nfsv4LookupResponse;
    expect(lookupRes.status).toBe(Nfsv4Stat.NFS4_OK);
    const getattrRes = response.resarray[2] as msg.Nfsv4GetattrResponse;
    expect(getattrRes.status).toBe(Nfsv4Stat.NFS4_OK);
    expect(getattrRes.resok).toBeDefined();
    await stop();
  });

  test('PUTROOTFH + LOOKUP non-existent file returns NFS4ERR_NOENT', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const response = await client.compound([nfs.PUTROOTFH(), nfs.LOOKUP('nonexistent.txt')]);
    expect(response.status).not.toBe(Nfsv4Stat.NFS4_OK);
    expect(response.resarray).toHaveLength(2);
    const putrootfhRes = response.resarray[0] as msg.Nfsv4PutrootfhResponse;
    expect(putrootfhRes.status).toBe(Nfsv4Stat.NFS4_OK);
    const lookupRes = response.resarray[1] as msg.Nfsv4LookupResponse;
    expect(lookupRes.status).toBe(Nfsv4Stat.NFS4ERR_NOENT);
    await stop();
  });

  test('PUTROOTFH + READDIR returns directory entries', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const response = await client.compound([nfs.PUTROOTFH(), nfs.READDIR(0x00000001)]);
    expect(response.status).toBe(Nfsv4Stat.NFS4_OK);
    expect(response.resarray).toHaveLength(2);
    const readdirRes = response.resarray[1] as msg.Nfsv4ReaddirResponse;
    expect(readdirRes.status).toBe(Nfsv4Stat.NFS4_OK);
    expect(readdirRes.resok).toBeDefined();
    expect(readdirRes.resok!.entries).toBeDefined();
    expect(readdirRes.resok!.entries.length).toBeGreaterThan(0);
    await stop();
  });

  test('PUTROOTFH + LOOKUP subdir + LOOKUPP returns to parent', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const response = await client.compound([nfs.PUTROOTFH(), nfs.GETFH(), nfs.LOOKUP('subdir'), nfs.LOOKUPP()]);
    expect(response.status).toBe(Nfsv4Stat.NFS4_OK);
    expect(response.resarray).toHaveLength(4);
    const lookupRes = response.resarray[2] as msg.Nfsv4LookupResponse;
    expect(lookupRes.status).toBe(Nfsv4Stat.NFS4_OK);
    const lookuppRes = response.resarray[3] as msg.Nfsv4LookuppResponse;
    expect(lookuppRes.status).toBe(Nfsv4Stat.NFS4_OK);
    await stop();
  });

  test('PUTROOTFH + ACCESS checks permissions', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const response = await client.compound([nfs.PUTROOTFH(), nfs.ACCESS()]);
    expect(response.status).toBe(Nfsv4Stat.NFS4_OK);
    expect(response.resarray).toHaveLength(2);
    const accessRes = response.resarray[1] as msg.Nfsv4AccessResponse;
    expect(accessRes.status).toBe(Nfsv4Stat.NFS4_OK);
    expect(accessRes.resok).toBeDefined();
    expect(accessRes.resok!.supported).toBeDefined();
    expect(accessRes.resok!.access).toBeDefined();
    await stop();
  });

  test('Multiple concurrent COMPOUND requests are handled correctly', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const promises = [
      client.compound([nfs.PUTROOTFH(), nfs.GETFH()]),
      client.compound([nfs.PUTROOTFH(), nfs.GETFH()]),
      client.compound([nfs.PUTROOTFH(), nfs.GETFH()]),
      client.compound([nfs.PUTROOTFH(), nfs.GETFH()]),
      client.compound([nfs.PUTROOTFH(), nfs.GETFH()]),
    ];
    const responses = await Promise.all(promises);
    expect(responses).toHaveLength(5);
    responses.forEach((response) => {
      expect(response.status).toBe(Nfsv4Stat.NFS4_OK);
      expect(response.resarray).toHaveLength(2);
    });
    await stop();
  });

  test('SAVEFH + RESTOREFH preserves filehandle', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const response = await client.compound([
      nfs.PUTROOTFH(),
      nfs.LOOKUP('file.txt'),
      nfs.SAVEFH(),
      nfs.PUTROOTFH(),
      nfs.RESTOREFH(),
      nfs.GETFH(),
    ]);
    expect(response.status).toBe(Nfsv4Stat.NFS4_OK);
    expect(response.resarray).toHaveLength(6);
    const savefhRes = response.resarray[2] as msg.Nfsv4SavefhResponse;
    expect(savefhRes.status).toBe(Nfsv4Stat.NFS4_OK);
    const restorefhRes = response.resarray[4] as msg.Nfsv4RestorefhResponse;
    expect(restorefhRes.status).toBe(Nfsv4Stat.NFS4_OK);
    const getfhRes = response.resarray[5] as msg.Nfsv4GetfhResponse;
    expect(getfhRes.status).toBe(Nfsv4Stat.NFS4_OK);
    await stop();
  });
});
