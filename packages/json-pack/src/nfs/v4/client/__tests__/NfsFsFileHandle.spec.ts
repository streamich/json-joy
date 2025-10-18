import {setupNfsClientServerTestbed} from '../../server/__tests__/setup';
import {Nfsv4FsClient} from '../Nfsv4FsClient';

describe('NfsFsFileHandle', () => {
  describe('.open() and .close()', () => {
    test('can open and close a file', async () => {
      const {client, stop} = await setupNfsClientServerTestbed();
      const fs = new Nfsv4FsClient(client);
      const fh = await fs.open('file.txt', 'r');
      expect(fh.fd).toBeGreaterThanOrEqual(0);
      await fh.close();
      await stop();
    });

    test('throws error when using closed file handle', async () => {
      const {client, stop} = await setupNfsClientServerTestbed();
      const fs = new Nfsv4FsClient(client);
      const fh = await fs.open('file.txt', 'r');
      await fh.close();
      await expect(fh.stat()).rejects.toThrow('File handle is closed');
      await stop();
    });

    test('close is idempotent', async () => {
      const {client, stop} = await setupNfsClientServerTestbed();
      const fs = new Nfsv4FsClient(client);
      const fh = await fs.open('file.txt', 'r');
      await fh.close();
      await fh.close();
      await stop();
    });
  });

  describe('.stat()', () => {
    test('can stat a file through file handle', async () => {
      const {client, stop} = await setupNfsClientServerTestbed();
      const fs = new Nfsv4FsClient(client);
      const fh = await fs.open('file.txt', 'r');
      const stats = await fh.stat();
      expect(stats.isFile()).toBe(true);
      expect(stats.size).toBeGreaterThan(0);
      await fh.close();
      await stop();
    });
  });

  describe('.readFile()', () => {
    test('can read file as text', async () => {
      const {client, stop} = await setupNfsClientServerTestbed();
      const fs = new Nfsv4FsClient(client);
      const fh = await fs.open('file.txt', 'r');
      const text = await fh.readFile('utf8');
      expect(text).toBe('Hello, NFS v4!\n');
      await fh.close();
      await stop();
    });

    test('can read file as buffer', async () => {
      const {client, stop} = await setupNfsClientServerTestbed();
      const fs = new Nfsv4FsClient(client);
      const fh = await fs.open('file.txt', 'r');
      const buffer = await fh.readFile();
      expect(Buffer.isBuffer(buffer)).toBe(true);
      expect(buffer.toString('utf8')).toBe('Hello, NFS v4!\n');
      await fh.close();
      await stop();
    });
  });

  describe('.read()', () => {
    test('can read data into buffer', async () => {
      const {client, stop} = await setupNfsClientServerTestbed();
      const fs = new Nfsv4FsClient(client);
      const fh = await fs.open('file.txt', 'r');
      const buffer = Buffer.alloc(10);
      const result = await fh.read(buffer, 0, 10, 0);
      expect(result.bytesRead).toBe(10);
      expect(buffer.toString('utf8', 0, 10)).toBe('Hello, NFS');
      await fh.close();
      await stop();
    });

    test('can read with position', async () => {
      const {client, stop} = await setupNfsClientServerTestbed();
      const fs = new Nfsv4FsClient(client);
      const fh = await fs.open('file.txt', 'r');
      const buffer = Buffer.alloc(5);
      const result = await fh.read(buffer, 0, 5, 7);
      expect(result.bytesRead).toBe(5);
      expect(buffer.toString('utf8')).toBe('NFS v');
      await fh.close();
      await stop();
    });

    test('handles reading at offset', async () => {
      const {client, stop} = await setupNfsClientServerTestbed();
      const fs = new Nfsv4FsClient(client);
      const fh = await fs.open('file.txt', 'r');
      const buffer = Buffer.alloc(20);
      const result = await fh.read(buffer, 5, 10, 0);
      expect(result.bytesRead).toBe(10);
      expect(buffer.toString('utf8', 5, 15)).toBe('Hello, NFS');
      await fh.close();
      await stop();
    });
  });

  describe('.write()', () => {
    test('can write buffer to file', async () => {
      const {client, stop, vol} = await setupNfsClientServerTestbed();
      const fs = new Nfsv4FsClient(client);
      await fs.writeFile('file.txt', '');
      const fh = await fs.open('file.txt', 'w');
      const data = Buffer.from('Test data');
      const result = await fh.write(data, 0, data.length, 0);
      expect(result.bytesWritten).toBe(9);
      await fh.close();
      const content = vol.readFileSync('/export/file.txt', 'utf8');
      expect(content).toBe('Test data');
      await stop();
    });

    test('can write at specific position', async () => {
      const {client, stop, vol} = await setupNfsClientServerTestbed();
      const fs = new Nfsv4FsClient(client);
      await fs.writeFile('file.txt', '0123456789');
      const fh = await fs.open('file.txt', 'r+');
      const data = Buffer.from('XXX');
      const result = await fh.write(data, 0, 3, 5);
      expect(result.bytesWritten).toBe(3);
      await fh.close();
      const content = vol.readFileSync('/export/file.txt', 'utf8');
      expect(content).toBe('01234XXX89');
      await stop();
    });

    test('can write Uint8Array', async () => {
      const {client, stop, vol} = await setupNfsClientServerTestbed();
      const fs = new Nfsv4FsClient(client);
      await fs.writeFile('file.txt', '');
      const fh = await fs.open('file.txt', 'w');
      const data = new Uint8Array([72, 101, 108, 108, 111]);
      const result = await fh.write(data, 0, 5, 0);
      expect(result.bytesWritten).toBe(5);
      await fh.close();
      const content = vol.readFileSync('/export/file.txt', 'utf8');
      expect(content).toBe('Hello');
      await stop();
    });
  });

  describe('.appendFile()', () => {
    test('can append text to file', async () => {
      const {client, stop, vol} = await setupNfsClientServerTestbed();
      const fs = new Nfsv4FsClient(client);
      await fs.writeFile('file.txt', 'Initial');
      const fh = await fs.open('file.txt', 'r');
      await fh.appendFile(' appended');
      await fh.close();
      const content = vol.readFileSync('/export/file.txt', 'utf8');
      expect(content).toBe('Initial appended');
      await stop();
    });

    test('can append buffer to file', async () => {
      const {client, stop, vol} = await setupNfsClientServerTestbed();
      const fs = new Nfsv4FsClient(client);
      await fs.writeFile('file.txt', 'Start');
      const fh = await fs.open('file.txt', 'r');
      await fh.appendFile(Buffer.from(' end'));
      await fh.close();
      const content = vol.readFileSync('/export/file.txt', 'utf8');
      expect(content).toBe('Start end');
      await stop();
    });
  });

  describe('.truncate()', () => {
    test('can truncate file to zero', async () => {
      const {client, stop} = await setupNfsClientServerTestbed();
      const fs = new Nfsv4FsClient(client);
      await fs.writeFile('file.txt', 'Long content here');
      const fh = await fs.open('file.txt', 'r');
      await fh.truncate(0);
      await fh.close();
      const stats = await fs.stat('file.txt');
      expect(stats.size).toBe(0);
      await stop();
    });

    test('can truncate file to specific size', async () => {
      const {client, stop, vol} = await setupNfsClientServerTestbed();
      const fs = new Nfsv4FsClient(client);
      await fs.writeFile('file.txt', '0123456789');
      const fh = await fs.open('file.txt', 'r');
      await fh.truncate(5);
      await fh.close();
      const content = vol.readFileSync('/export/file.txt', 'utf8');
      expect(content).toBe('01234');
      await stop();
    });
  });

  describe('.chmod()', () => {
    test('can change file mode', async () => {
      const {client, stop} = await setupNfsClientServerTestbed();
      const fs = new Nfsv4FsClient(client);
      const fh = await fs.open('file.txt', 'r');
      await fh.chmod(0o755);
      const stats = await fh.stat();
      expect(Number(stats.mode) & 0o777).toBe(0o755);
      await fh.close();
      await stop();
    });
  });

  describe('.chown()', () => {
    test('can change file owner', async () => {
      const {client, stop} = await setupNfsClientServerTestbed();
      const fs = new Nfsv4FsClient(client);
      const fh = await fs.open('file.txt', 'r');
      await fh.chown(1001, 1002);
      await fh.close();
      await stop();
    });
  });

  describe('.utimes()', () => {
    test('can update file times', async () => {
      const {client, stop} = await setupNfsClientServerTestbed();
      const fs = new Nfsv4FsClient(client);
      const fh = await fs.open('file.txt', 'r');
      const newTime = new Date('2023-01-01T00:00:00Z');
      await fh.utimes(newTime, newTime);
      const stats = await fh.stat();
      expect(Math.abs(Number(stats.atimeMs) - newTime.getTime())).toBeLessThan(1000);
      expect(Math.abs(Number(stats.mtimeMs) - newTime.getTime())).toBeLessThan(1000);
      await fh.close();
      await stop();
    });
  });

  describe('.datasync()', () => {
    test('datasync does not throw', async () => {
      const {client, stop} = await setupNfsClientServerTestbed();
      const fs = new Nfsv4FsClient(client);
      const fh = await fs.open('file.txt', 'r');
      await expect(fh.datasync()).resolves.not.toThrow();
      await fh.close();
      await stop();
    });
  });

  describe('.writeFile()', () => {
    test('can write file content', async () => {
      const {client, stop, vol} = await setupNfsClientServerTestbed();
      const fs = new Nfsv4FsClient(client);
      await fs.writeFile('file.txt', '');
      const fh = await fs.open('file.txt', 'w');
      await fh.writeFile('Complete content');
      await fh.close();
      const content = vol.readFileSync('/export/file.txt', 'utf8');
      expect(content).toBe('Complete content');
      await stop();
    });

    test('can write buffer content', async () => {
      const {client, stop, vol} = await setupNfsClientServerTestbed();
      const fs = new Nfsv4FsClient(client);
      await fs.writeFile('file.txt', '');
      const fh = await fs.open('file.txt', 'w');
      await fh.writeFile(Buffer.from('Buffer data'));
      await fh.close();
      const content = vol.readFileSync('/export/file.txt', 'utf8');
      expect(content).toBe('Buffer data');
      await stop();
    });
  });

  describe('.readv()', () => {
    test('can read into multiple buffers', async () => {
      const {client, stop} = await setupNfsClientServerTestbed();
      const fs = new Nfsv4FsClient(client);
      await fs.writeFile('file.txt', 'Hello, World!');
      const fh = await fs.open('file.txt', 'r');
      const buffer1 = Buffer.alloc(5);
      const buffer2 = Buffer.alloc(8);
      const result = await fh.readv([buffer1, buffer2], 0);
      expect(result.bytesRead).toBe(13);
      expect(buffer1.toString('utf8')).toBe('Hello');
      expect(buffer2.toString('utf8')).toBe(', World!');
      await fh.close();
      await stop();
    });

    test('can read with position', async () => {
      const {client, stop} = await setupNfsClientServerTestbed();
      const fs = new Nfsv4FsClient(client);
      await fs.writeFile('file.txt', 'Hello, World!');
      const fh = await fs.open('file.txt', 'r');
      const buffer1 = Buffer.alloc(5);
      const buffer2 = Buffer.alloc(6);
      const result = await fh.readv([buffer1, buffer2], 7);
      expect(result.bytesRead).toBe(6);
      expect(buffer1.toString('utf8', 0, 5)).toBe('World');
      expect(buffer2.toString('utf8', 0, 1)).toBe('!');
      await fh.close();
      await stop();
    });

    test('handles partial reads at end of file', async () => {
      const {client, stop} = await setupNfsClientServerTestbed();
      const fs = new Nfsv4FsClient(client);
      await fs.writeFile('file.txt', 'Short');
      const fh = await fs.open('file.txt', 'r');
      const buffer1 = Buffer.alloc(3);
      const buffer2 = Buffer.alloc(10);
      const result = await fh.readv([buffer1, buffer2], 0);
      expect(result.bytesRead).toBe(5);
      expect(buffer1.toString('utf8')).toBe('Sho');
      expect(buffer2.toString('utf8', 0, 2)).toBe('rt');
      await fh.close();
      await stop();
    });
  });

  describe('.writev()', () => {
    test('can write multiple buffers', async () => {
      const {client, stop, vol} = await setupNfsClientServerTestbed();
      const fs = new Nfsv4FsClient(client);
      await fs.writeFile('file.txt', '');
      const fh = await fs.open('file.txt', 'w');
      const buffer1 = Buffer.from('Hello');
      const buffer2 = Buffer.from(', ');
      const buffer3 = Buffer.from('World!');
      const result = await fh.writev([buffer1, buffer2, buffer3], 0);
      expect(result.bytesWritten).toBe(13);
      await fh.close();
      const content = vol.readFileSync('/export/file.txt', 'utf8');
      expect(content).toBe('Hello, World!');
      await stop();
    });

    test('can write with position', async () => {
      const {client, stop, vol} = await setupNfsClientServerTestbed();
      const fs = new Nfsv4FsClient(client);
      await fs.writeFile('file.txt', '0123456789');
      const fh = await fs.open('file.txt', 'r+');
      const buffer1 = Buffer.from('XX');
      const buffer2 = Buffer.from('YY');
      const result = await fh.writev([buffer1, buffer2], 3);
      expect(result.bytesWritten).toBe(4);
      await fh.close();
      const content = vol.readFileSync('/export/file.txt', 'utf8');
      expect(content).toBe('012XXYY789');
      await stop();
    });

    test('can write Uint8Array buffers', async () => {
      const {client, stop, vol} = await setupNfsClientServerTestbed();
      const fs = new Nfsv4FsClient(client);
      await fs.writeFile('file.txt', '');
      const fh = await fs.open('file.txt', 'w');
      const buffer1 = new Uint8Array([65, 66, 67]);
      const buffer2 = new Uint8Array([68, 69, 70]);
      const result = await fh.writev([buffer1, buffer2], 0);
      expect(result.bytesWritten).toBe(6);
      await fh.close();
      const content = vol.readFileSync('/export/file.txt', 'utf8');
      expect(content).toBe('ABCDEF');
      await stop();
    });
  });

  describe('multiple operations', () => {
    test('can read and write to same file handle', async () => {
      const {client, stop, vol} = await setupNfsClientServerTestbed();
      const fs = new Nfsv4FsClient(client);
      await fs.writeFile('file.txt', 'Initialxcontent');
      const fh = await fs.open('file.txt', 'r+');
      const buffer = Buffer.alloc(7);
      const readResult = await fh.read(buffer, 0, 7, 0);
      expect(readResult.bytesRead).toBe(7);
      expect(buffer.toString('utf8')).toBe('Initial');
      const writeData = Buffer.from('Modified');
      const writeResult = await fh.write(writeData, 0, 8, 0);
      expect(writeResult.bytesWritten).toBe(8);
      await fh.close();
      const content = vol.readFileSync('/export/file.txt', 'utf8');
      expect(content).toBe('Modifiedcontent');
      await stop();
    });

    test('can perform multiple stat calls', async () => {
      const {client, stop} = await setupNfsClientServerTestbed();
      const fs = new Nfsv4FsClient(client);
      const fh = await fs.open('file.txt', 'r');
      const stats1 = await fh.stat();
      const stats2 = await fh.stat();
      expect(stats1.size).toBe(stats2.size);
      expect(stats1.ino).toBe(stats2.ino);
      await fh.close();
      await stop();
    });

    test('can truncate and then write', async () => {
      const {client, stop, vol} = await setupNfsClientServerTestbed();
      const fs = new Nfsv4FsClient(client);
      await fs.writeFile('file.txt', 'Old content that will be replaced');
      const fh = await fs.open('file.txt', 'w');
      await fh.truncate(0);
      const data = Buffer.from('New content');
      await fh.write(data, 0, data.length, 0);
      await fh.close();
      const content = vol.readFileSync('/export/file.txt', 'utf8');
      expect(content).toBe('New content');
      await stop();
    });
  });

  describe('error handling', () => {
    test('cannot read from closed handle', async () => {
      const {client, stop} = await setupNfsClientServerTestbed();
      const fs = new Nfsv4FsClient(client);
      const fh = await fs.open('file.txt', 'r');
      await fh.close();
      const buffer = Buffer.alloc(10);
      await expect(fh.read(buffer, 0, 10, 0)).rejects.toThrow('File handle is closed');
      await stop();
    });

    test('cannot write to closed handle', async () => {
      const {client, stop} = await setupNfsClientServerTestbed();
      const fs = new Nfsv4FsClient(client);
      const fh = await fs.open('file.txt', 'w');
      await fh.close();
      const data = Buffer.from('test');
      await expect(fh.write(data, 0, 4, 0)).rejects.toThrow('File handle is closed');
      await stop();
    });

    test('cannot truncate closed handle', async () => {
      const {client, stop} = await setupNfsClientServerTestbed();
      const fs = new Nfsv4FsClient(client);
      const fh = await fs.open('file.txt', 'w');
      await fh.close();
      await expect(fh.truncate(0)).rejects.toThrow('File handle is closed');
      await stop();
    });
  });

  describe('streams', () => {
    describe('.createReadStream()', () => {
      test('can read file as stream', async () => {
        const {client, stop} = await setupNfsClientServerTestbed();
        const fs = new Nfsv4FsClient(client);
        await fs.writeFile('file.txt', 'Hello, World!');
        const fh = await fs.open('file.txt', 'r');
        const stream = fh.createReadStream({});
        const chunks: Buffer[] = [];
        for await (const chunk of stream) {
          chunks.push(chunk);
        }
        await fh.close();
        const content = Buffer.concat(chunks).toString('utf8');
        expect(content).toBe('Hello, World!');
        await stop();
      });

      test('can read with start option', async () => {
        const {client, stop} = await setupNfsClientServerTestbed();
        const fs = new Nfsv4FsClient(client);
        await fs.writeFile('file.txt', 'Hello, World!');
        const fh = await fs.open('file.txt', 'r');
        const stream = fh.createReadStream({start: 7});
        const chunks: Buffer[] = [];
        for await (const chunk of stream) {
          chunks.push(chunk);
        }
        await fh.close();
        const content = Buffer.concat(chunks).toString('utf8');
        expect(content).toBe('World!');
        await stop();
      });

      test('can read with start and end options', async () => {
        const {client, stop} = await setupNfsClientServerTestbed();
        const fs = new Nfsv4FsClient(client);
        await fs.writeFile('file.txt', 'Hello, World!');
        const fh = await fs.open('file.txt', 'r');
        const stream = fh.createReadStream({start: 0, end: 5});
        const chunks: Buffer[] = [];
        for await (const chunk of stream) {
          chunks.push(chunk);
        }
        await fh.close();
        const content = Buffer.concat(chunks).toString('utf8');
        expect(content).toBe('Hello');
        await stop();
      });

      test('stream has path property', async () => {
        const {client, stop} = await setupNfsClientServerTestbed();
        const fs = new Nfsv4FsClient(client);
        const fh = await fs.open('file.txt', 'r');
        const stream = fh.createReadStream({});
        expect(stream.path).toBe('file.txt');
        stream.destroy();
        await fh.close();
        await stop();
      });
    });

    describe('.createWriteStream()', () => {
      test('can write file as stream', async () => {
        const {client, stop, vol} = await setupNfsClientServerTestbed();
        const fs = new Nfsv4FsClient(client);
        await fs.writeFile('file.txt', '');
        const fh = await fs.open('file.txt', 'w');
        const stream = fh.createWriteStream({});
        stream.write('Hello');
        stream.write(', ');
        stream.write('World!');
        await new Promise((resolve, reject) => {
          stream.end((err?: Error) => (err ? reject(err) : resolve(undefined)));
        });
        await fh.close();
        const content = vol.readFileSync('/export/file.txt', 'utf8');
        expect(content).toBe('Hello, World!');
        await stop();
      });

      test('can write with start option', async () => {
        const {client, stop, vol} = await setupNfsClientServerTestbed();
        const fs = new Nfsv4FsClient(client);
        await fs.writeFile('file.txt', '0123456789');
        const fh = await fs.open('file.txt', 'r+');
        const stream = fh.createWriteStream({start: 5});
        stream.write('XXXXX');
        await new Promise((resolve, reject) => {
          stream.end((err?: Error) => (err ? reject(err) : resolve(undefined)));
        });
        await fh.close();
        const content = vol.readFileSync('/export/file.txt', 'utf8');
        expect(content).toBe('01234XXXXX');
        await stop();
      });

      test('stream has path property', async () => {
        const {client, stop} = await setupNfsClientServerTestbed();
        const fs = new Nfsv4FsClient(client);
        await fs.writeFile('file.txt', '');
        const fh = await fs.open('file.txt', 'w');
        const stream = fh.createWriteStream({});
        expect(stream.path).toBe('file.txt');
        stream.destroy();
        await fh.close();
        await stop();
      });

      test('handles multiple chunks efficiently', async () => {
        const {client, stop, vol} = await setupNfsClientServerTestbed();
        const fs = new Nfsv4FsClient(client);
        await fs.writeFile('file.txt', '');
        const fh = await fs.open('file.txt', 'w');
        const stream = fh.createWriteStream({});
        for (let i = 0; i < 10; i++) {
          stream.write(`chunk${i}`);
        }
        await new Promise((resolve, reject) => {
          stream.end((err?: Error) => (err ? reject(err) : resolve(undefined)));
        });
        await fh.close();
        const content = vol.readFileSync('/export/file.txt', 'utf8');
        expect(content).toBe('chunk0chunk1chunk2chunk3chunk4chunk5chunk6chunk7chunk8chunk9');
        await stop();
      });
    });

    describe('.readableWebStream()', () => {
      test('can create web stream', async () => {
        const {client, stop} = await setupNfsClientServerTestbed();
        const fs = new Nfsv4FsClient(client);
        await fs.writeFile('file.txt', 'Hello, Web Streams!');
        const fh = await fs.open('file.txt', 'r');
        const webStream = fh.readableWebStream();
        expect(webStream).toBeInstanceOf(ReadableStream);
        const reader = webStream.getReader();
        const chunks: Uint8Array[] = [];
        while (true) {
          const {done, value} = await reader.read();
          if (done) break;
          chunks.push(value);
        }
        await fh.close();
        const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
        const result = new Uint8Array(totalLength);
        let offset = 0;
        for (const chunk of chunks) {
          result.set(chunk, offset);
          offset += chunk.length;
        }
        const content = new TextDecoder().decode(result);
        expect(content).toBe('Hello, Web Streams!');
        await stop();
      });

      test('can read with start option', async () => {
        const {client, stop} = await setupNfsClientServerTestbed();
        const fs = new Nfsv4FsClient(client);
        await fs.writeFile('file.txt', 'Hello, Web Streams!');
        const fh = await fs.open('file.txt', 'r');
        const webStream = fh.readableWebStream({} as any);
        const reader = webStream.getReader();
        const chunks: Uint8Array[] = [];
        while (true) {
          const {done, value} = await reader.read();
          if (done) break;
          chunks.push(value);
        }
        await fh.close();
        const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
        const result = new Uint8Array(totalLength);
        let offset = 0;
        for (const chunk of chunks) {
          result.set(chunk, offset);
          offset += chunk.length;
        }
        const content = new TextDecoder().decode(result);
        expect(content).toBe('Hello, Web Streams!');
        await stop();
      });
    });
  });
});
