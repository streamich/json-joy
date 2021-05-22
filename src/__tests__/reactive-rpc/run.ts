import {spawn} from 'child_process';
import {Defer} from '../../util/Defer';

const startServer = async () => {
  const started = new Defer<void>();
  const exitCode = new Defer<number>();
  const cp = spawn('yarn', ['demo:reactive-rpc:server'], {});
  process.on('exit', (code) => {
    cp.kill();
  });
  cp.stdout.on('data', (data) => {
    const line = String(data);
    if (line.indexOf('SERVER_STARTED') > -1) started.resolve();
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

const runTests = async () => {
  const exitCode = new Defer<number>();
  const cp = spawn('yarn', ['test:reactive-rpc:jest'], {
    env: {
      ...process.env,
      TEST_E2E: '1',
    },
  });
  process.on('exit', (code) => {
    cp.kill();
  });
  cp.stdout.on('data', (data) => {
    const line = String(data);
    process.stderr.write('[jest] ' + line);
  });
  cp.stderr.on('data', (data) => {
    process.stderr.write('ERROR: [jest] ' + String(data));
  });
  cp.on('close', (code) => {
    exitCode.resolve(code);
    process.stdout.write('[jest] ' + `process exited with code ${code}\n`);
  });
  return {
    cp,
    exitCode: exitCode.promise,
  };
};

(async () => {
  try {
    const server = await startServer();
    await server.started;
    const jest = await runTests();
    const exitCode = await jest.exitCode;
    process.exit(exitCode);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
