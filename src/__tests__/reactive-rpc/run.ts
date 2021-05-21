import {spawn} from 'child_process';
import {Defer} from '../../util/Defer';

const startServer = async () => {
  const started = new Defer<void>();
  const exitCode = new Defer<number>();
  const cp = spawn('yarn', ['demo:reactive-rpc'], {});
  process.on('exit', (code) => {
    cp.kill();
  });
  cp.stdout.on('data', (data) => {
    const line = String(data);
    try {
      const json = JSON.parse(line);
      if (typeof json === 'object') {
        if (json && json.msg === 'SERVER_STARTED') started.resolve();
      }
    } catch {}
    process.stderr.write('[server] ' + line);
  });
  cp.stderr.on('data', (data) => {
    process.stderr.write('ERROR: [server] ' + String(data));
  });
  cp.on('close', (code) => {
    exitCode.resolve(code);
    process.stdout.write('[server] ' + `process exited with code ${code}\n`);
  });
  return {
    cp,
    started: started.promise,
    exitCode: exitCode.promise,
  };
};

(async () => {
  try {
    const server = await startServer();
    await server.started;
    // const jest = await runTests();
    // const exitCode = await jest.exitCode;
    // process.exit(exitCode);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
