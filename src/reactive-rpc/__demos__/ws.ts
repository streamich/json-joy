// npx ts-node src/reactive-rpc/__demos__/ws.ts

import {Http1Server} from '../server/http1/Http1Server';

const server = Http1Server.start();

server.ws({
  path: '/ws',
  onConnect: (connection) => {
    console.log('CONNECTED');
  },
});

server.start();
