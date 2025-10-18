import {Duplex, PassThrough} from 'stream';
import {memfs} from 'memfs';
import {Nfsv4Connection} from '../Nfsv4Connection';
import {Nfsv4TcpClient} from '../../client/Nfsv4TcpClient';
import {Nfsv4OperationsNode} from '../operations/node/Nfsv4OperationsNode';

/**
 * Creates a pair of connected Duplex streams (client and server).
 * Data written to client flows to server and vice versa.
 */
function makeDuplexPair(): {client: Duplex; server: Duplex} {
  const clientToServer = new PassThrough();
  const serverToClient = new PassThrough();
  const client = new Duplex({
    read() {},
    write(chunk, _enc, cb) {
      clientToServer.write(chunk, cb);
    },
  });
  const server = new Duplex({
    read() {},
    write(chunk, _enc, cb) {
      serverToClient.write(chunk, cb);
    },
  });
  clientToServer.on('data', (chunk) => {
    server.push(chunk);
  });
  serverToClient.on('data', (chunk) => {
    client.push(chunk);
  });
  return {client, server};
}

export const setupNfsClientServerTestbed = async () => {
  const {vol, fs} = memfs();

  // Populate the filesystem
  vol.fromJSON({
    '/export': null,
    '/export/file.txt': 'Hello, NFS v4!\n',
    '/export/subdir': null,
    '/export/subdir/nested.dat': 'nested data',
  });

  const {client: clientDuplex, server: serverDuplex} = makeDuplexPair();
  const client = Nfsv4TcpClient.fromDuplex(clientDuplex, {debug: false});
  const ops = new Nfsv4OperationsNode({fs: fs as any, dir: '/export'});
  const connection = new Nfsv4Connection({
    duplex: serverDuplex,
    ops,
    debug: false,
  });
  const stop = async () => {
    connection.close();
    client.close();
    clientDuplex.destroy();
    serverDuplex.destroy();
  };
  return {
    vol,
    fs,
    client,
    ops,
    connection,
    clientDuplex,
    serverDuplex,
    stop,
  };
};
