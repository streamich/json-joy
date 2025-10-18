import {setupNfsClientServerTestbed} from '../../../__tests__/setup';
import type * as msg from '../../../../messages';
import {Nfsv4Stat} from '../../../../constants';
import {nfs} from '../../../../builder';

describe('OPENATTR operation', () => {
  test('returns NFS4ERR_NOTSUPP for named attribute directories', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const openattrReq = nfs.OPENATTR(false);
    const response = await client.compound([nfs.PUTROOTFH(), openattrReq]);
    const openattrRes = response.resarray[1] as msg.Nfsv4OpenattrResponse;
    expect(openattrRes.status).toBe(Nfsv4Stat.NFS4ERR_NOTSUPP);
    await stop();
  });

  test('returns NFS4ERR_NOTSUPP with createdir flag', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const openattrReq = nfs.OPENATTR(true);
    const response = await client.compound([nfs.PUTROOTFH(), openattrReq]);
    const openattrRes = response.resarray[1] as msg.Nfsv4OpenattrResponse;
    expect(openattrRes.status).toBe(Nfsv4Stat.NFS4ERR_NOTSUPP);
    await stop();
  });
});
