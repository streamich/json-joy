// npx ts-node src/reactive-rpc/__demos__/ws.ts

import {Http1Server} from '../server/http1/Http1Server';

const server = Http1Server.start();

server.ws({
  path: '/ws',
  onConnect: (connection) => {
    console.log('CONNECTED');
    connection.onmessage = (data, isUtf8) => {
      console.log('MESSAGE', data, isUtf8);
    };
  },
});

server.start();
