// npx ts-node src/reactive-rpc/__demos__/ws.ts

import {WsServer} from '../server/ws/server/WsServer';

const server = new WsServer();
server.start();
