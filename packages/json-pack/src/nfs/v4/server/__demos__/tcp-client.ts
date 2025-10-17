import {Nfsv4CompoundRequest, Nfsv4PutfhRequest, Nfsv4LookupRequest, Nfsv4GetfhRequest} from '../../messages';
import {Nfsv4Fh} from '../../structs';
import {Nfsv4TcpClient} from '../../client/Nfsv4TcpClient';

/* tslint:disable:no-console */

const PORT = Number(process.env.NFS_PORT) || Number(process.env.PORT) || 2049;
const HOST = process.env.NFS_HOST
  ? String(process.env.NFS_HOST)
  : process.env.HOST
    ? String(process.env.HOST)
    : '127.0.0.1';

const createTestCompoundRequest = (): Nfsv4CompoundRequest => {
  const fhData = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
  const fh = new Nfsv4Fh(fhData);
  const putfh = new Nfsv4PutfhRequest(fh);
  const lookup = new Nfsv4LookupRequest('testfile.txt');
  const getfh = new Nfsv4GetfhRequest();
  return new Nfsv4CompoundRequest('nfs4_client', 0, [putfh, lookup, getfh]);
};

const main = async () => {
  const client = new Nfsv4TcpClient({
    host: HOST,
    port: PORT,
    debug: true,
  });
  try {
    console.log(`Connecting to NFSv4 server at ${HOST}:${PORT}...`);
    await client.connect();
    console.log('Connected successfully!\n');
    console.log('Sending NULL request...');
    await client.null();
    console.log('NULL request succeeded\n');
    console.log('Sending COMPOUND request (PUTFH + LOOKUP + GETFH)...');
    const request = createTestCompoundRequest();
    const response = await client.compound(request);
    console.log('\nReceived COMPOUND response:');
    console.log(`  Status: ${response.status}`);
    console.log(`  Tag: "${response.tag}"`);
    console.log(`  Operations: ${response.resarray.length}`);
    response.resarray.forEach((op: any, idx: number) => {
      console.log(`    [${idx}] ${op.constructor.name}`);
      console.log(`        Status: ${op.status}`);
    });
    console.log('\nClosing connection...');
    client.close();
    console.log('Done.');
    process.exit(0);
  } catch (err: any) {
    console.error('Error:', err.message);
    client.close();
    process.exit(1);
  }
};

main();
