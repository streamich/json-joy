import {Nfsv4OperationsNode} from '../operations/node/Nfsv4OperationsNode';
import {Nfsv4TcpServer} from '../Nfsv4TcpServer';
import {fs, vol} from 'memfs';
// import * as fs from 'fs';

// const dir = __dirname + '/mnt';
// if (!fs.existsSync(dir)) fs.mkdirSync(dir);
// if (!fs.existsSync(dir + '/export')) fs.mkdirSync(dir + '/export');
// if (!fs.existsSync(dir + '/export/file.txt')) fs.writeFileSync(dir + '/export/file.txt', 'Hello, NFS v4!\n');

const dir = '/';
vol.fromJSON({
  '/export': null,
  '/export/file.txt': 'Hello, NFS v4!\n',
});

// tslint:disable-next-line:no-console
console.log(vol.toJSON());

const ops = new Nfsv4OperationsNode({fs: <any>fs, dir});
Nfsv4TcpServer.start({ops, debug: true});
