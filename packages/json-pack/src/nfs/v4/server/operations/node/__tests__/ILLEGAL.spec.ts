import {setupNfsClientServerTestbed} from '../../../__tests__/setup';
import * as msg from '../../../../messages';
import {Nfsv4Stat} from '../../../../constants';
import {nfs} from '../../../../builder';

describe('RFC 7530 §15.2.4 - Illegal operation handling', () => {
  test('ILLEGAL operation returns NFS4ERR_OP_ILLEGAL', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const response = await client.compound([nfs.PUTROOTFH(), nfs.ILLEGAL()]);
    expect(response.resarray[0].status).toBe(Nfsv4Stat.NFS4_OK);
    const illegalRes = response.resarray[1] as msg.Nfsv4IllegalResponse;
    expect(illegalRes).toBeInstanceOf(msg.Nfsv4IllegalResponse);
    expect(illegalRes.status).toBe(Nfsv4Stat.NFS4ERR_OP_ILLEGAL);
    expect(response.status).toBe(Nfsv4Stat.NFS4ERR_OP_ILLEGAL);
    await stop();
  });

  test('server continues processing after ILLEGAL operation', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const response = await client.compound([nfs.PUTROOTFH(), nfs.ILLEGAL(), nfs.GETFH()]);
    expect(response.resarray[0].status).toBe(Nfsv4Stat.NFS4_OK);
    expect(response.resarray[1].status).toBe(Nfsv4Stat.NFS4ERR_OP_ILLEGAL);
    expect(response.resarray.length).toBe(2);
    await stop();
  });

  test('server handles ILLEGAL without crashing subsequent requests', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const response1 = await client.compound([nfs.PUTROOTFH(), nfs.ILLEGAL()]);
    expect(response1.status).toBe(Nfsv4Stat.NFS4ERR_OP_ILLEGAL);
    const response2 = await client.compound([nfs.PUTROOTFH(), nfs.GETFH()]);
    expect(response2.status).toBe(Nfsv4Stat.NFS4_OK);
    expect(response2.resarray[0].status).toBe(Nfsv4Stat.NFS4_OK);
    expect(response2.resarray[1].status).toBe(Nfsv4Stat.NFS4_OK);
    await stop();
  });

  test('multiple ILLEGAL operations in same COMPOUND', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const response = await client.compound([nfs.PUTROOTFH(), nfs.ILLEGAL(), nfs.ILLEGAL()]);
    expect(response.resarray[0].status).toBe(Nfsv4Stat.NFS4_OK);
    expect(response.resarray[1].status).toBe(Nfsv4Stat.NFS4ERR_OP_ILLEGAL);
    expect(response.resarray.length).toBe(2);
    await stop();
  });
});
