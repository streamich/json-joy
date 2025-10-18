import {setupNfsClientServerTestbed} from '../../server/__tests__/setup';
import {Nfsv4FsClient} from '../Nfsv4FsClient';

describe('.readFile()', () => {
  test('can read files as text', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    const text = await fs.readFile('file.txt', 'utf8');
    expect(text).toBe('Hello, NFS v4!\n');
    await stop();
  });

  test('can read files as buffer', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    const buffer = await fs.readFile('file.txt');
    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.toString('utf8')).toBe('Hello, NFS v4!\n');
    await stop();
  });

  test('can read nested files', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    const text = await fs.readFile('/subdir/nested.dat', 'utf8');
    expect(text).toBe('nested data');
    await stop();
  });
});

describe('.writeFile()', () => {
  test('can write text to file', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    await fs.writeFile('file.txt', 'New content!');
    const text = await fs.readFile('file.txt', 'utf8');
    expect(text).toBe('New content!');
    await stop();
  });

  test('can write buffer to file', async () => {
    const {client, stop, vol} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    const data = Buffer.from('Binary data');
    await fs.writeFile('file.txt', data);
    const content = vol.readFileSync('/export/file.txt');
    expect(Buffer.from(content as any).toString()).toBe('Binary data');
    await stop();
  });

  test('can create a new file', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    await fs.writeFile('new_file.md', 'abc');
    const text = await fs.readFile('/new_file.md', 'utf8');
    expect(text).toBe('abc');
    await stop();
  });

  test('can write to nested file', async () => {
    const {client, stop, vol} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    await fs.writeFile('subdir/nested.dat', 'Updated nested');
    const content = vol.readFileSync('/export/subdir/nested.dat', 'utf8');
    expect(content).toBe('Updated nested');
    await stop();
  });
});

describe('.stat()', () => {
  test('can stat a file', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    const stats = await fs.stat('file.txt');
    expect(stats.isFile()).toBe(true);
    expect(stats.isDirectory()).toBe(false);
    expect(stats.size).toBe(15);
    expect(stats.mode).toBeGreaterThan(0);
    expect(stats.nlink).toBeGreaterThan(0);
    await stop();
  });

  test('can stat a directory', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    const stats = await fs.stat('subdir');
    expect(stats.isDirectory()).toBe(true);
    expect(stats.isFile()).toBe(false);
    await stop();
  });

  test('can stat nested file', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    const stats = await fs.stat('subdir/nested.dat');
    expect(stats.isFile()).toBe(true);
    expect(stats.size).toBe(11);
    expect(stats.ctimeMs <= Date.now()).toBe(true);
    await stop();
  });
});

describe('.lstat()', () => {
  test('can lstat a file', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    const stats = await fs.lstat('file.txt');
    expect(stats.isFile()).toBe(true);
    expect(stats.isDirectory()).toBe(false);
    expect(stats.size).toBe(15);
    expect(stats.mode).toBeGreaterThan(0);
    expect(stats.nlink).toBeGreaterThan(0);
    await stop();
  });

  test('can lstat a directory', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    const stats = await fs.lstat('subdir');
    expect(stats.isDirectory()).toBe(true);
    expect(stats.isFile()).toBe(false);
    await stop();
  });

  test('can lstat a symbolic link without following it', async () => {
    const {client, stop, vol} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    vol.symlinkSync('file.txt', '/export/link.txt');
    const stats = await fs.lstat('link.txt');
    expect(stats.isSymbolicLink()).toBe(true);
    expect(stats.isFile()).toBe(false);
    await stop();
  });

  test('lstat returns different results than stat for symlinks', async () => {
    const {client, stop, vol} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    vol.symlinkSync('file.txt', '/export/link.txt');
    const lstatResult = await fs.lstat('link.txt');
    expect(lstatResult.isSymbolicLink()).toBe(true);
    await stop();
  });

  test('can lstat nested file', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    const stats = await fs.lstat('subdir/nested.dat');
    expect(stats.isFile()).toBe(true);
    expect(stats.size).toBe(11);
    await stop();
  });
});

describe('.mkdir()', () => {
  test('can create a directory', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    await fs.mkdir('newdir');
    const stats = await fs.stat('newdir');
    expect(stats.isDirectory()).toBe(true);
    await stop();
  });

  test('can create nested directory', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    await fs.mkdir('subdir/newsubdir');
    const stats = await fs.stat('subdir/newsubdir');
    expect(stats.isDirectory()).toBe(true);
    await stop();
  });
});

describe('.readdir()', () => {
  test('can read directory entries', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    const entries = await fs.readdir('/');
    expect(Array.isArray(entries)).toBe(true);
    expect(entries.length).toBeGreaterThan(0);
    expect(entries).toContain('file.txt');
    expect(entries).toContain('subdir');
    await stop();
  });

  test('does not create directories recursively', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    expect(fs.readdir('/subdir/a/b')).rejects.toThrow();
    await stop();
  });

  test('can read directory with file types', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    const entries = (await fs.readdir('/', {withFileTypes: true})) as any[];
    expect(Array.isArray(entries)).toBe(true);
    expect(entries.length).toBeGreaterThan(0);
    const fileEntry = entries.find((e: any) => e.name === 'file.txt');
    expect(fileEntry).toBeDefined();
    expect(fileEntry.isFile()).toBe(true);
    expect(fileEntry.isDirectory()).toBe(false);
    const dirEntry = entries.find((e: any) => e.name === 'subdir');
    expect(dirEntry).toBeDefined();
    expect(dirEntry.isDirectory()).toBe(true);
    expect(dirEntry.isFile()).toBe(false);
    await stop();
  });

  test('can read nested directory', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    const entries = await fs.readdir('subdir');
    expect(Array.isArray(entries)).toBe(true);
    expect(entries).toContain('nested.dat');
    await stop();
  });
});

describe('.truncate()', () => {
  test('can truncate file to zero', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    await fs.truncate('file.txt', 0);
    const stats = await fs.stat('file.txt');
    expect(stats.size).toBe(0);
    await stop();
  });

  test('can truncate file to specific size', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    await fs.truncate('file.txt', 5);
    const stats = await fs.stat('file.txt');
    expect(stats.size).toBe(5);
    const content = await fs.readFile('file.txt', 'utf8');
    expect(content).toBe('Hello');
    await stop();
  });

  test('can truncate nested file', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    await fs.truncate('subdir/nested.dat', 6);
    const stats = await fs.stat('subdir/nested.dat');
    expect(stats.size).toBe(6);
    await stop();
  });
});

describe('.appendFile()', () => {
  test('can append text to file', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    await fs.appendFile('file.txt', ' Appended!');
    const content = await fs.readFile('file.txt', 'utf8');
    expect(content).toBe('Hello, NFS v4!\n Appended!');
    await stop();
  });

  test('can append buffer to file', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    const data = Buffer.from(' More data');
    await fs.appendFile('file.txt', data);
    const content = await fs.readFile('file.txt', 'utf8');
    expect(content).toBe('Hello, NFS v4!\n More data');
    await stop();
  });

  test('can append to nested file', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    await fs.appendFile('subdir/nested.dat', '+++');
    const content = await fs.readFile('subdir/nested.dat', 'utf8');
    expect(content).toBe('nested data+++');
    await stop();
  });
});

describe('.unlink()', () => {
  test('can delete a file', async () => {
    const {client, stop, vol} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    await fs.unlink('file.txt');
    expect(vol.existsSync('/export/file.txt')).toBe(false);
    await stop();
  });

  test('can delete nested file', async () => {
    const {client, stop, vol} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    await fs.unlink('subdir/nested.dat');
    expect(vol.existsSync('/export/subdir/nested.dat')).toBe(false);
    await stop();
  });

  test('throws error when deleting non-existent file', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    await expect(fs.unlink('nonexistent.txt')).rejects.toThrow();
    await stop();
  });
});

describe('.rmdir()', () => {
  test('can remove empty directory', async () => {
    const {client, stop, vol} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    expect(vol.existsSync('/export/emptydir')).toBe(false);
    await fs.mkdir('emptydir');
    expect(vol.existsSync('/export/emptydir')).toBe(true);
    await fs.rmdir('emptydir');
    expect(vol.existsSync('/export/emptydir')).toBe(false);
    await stop();
  });

  test('can remove nested directory', async () => {
    const {client, stop, vol} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    await fs.mkdir('subdir/newsubdir');
    await fs.rmdir('subdir/newsubdir');
    expect(vol.existsSync('/export/subdir/newsubdir')).toBe(false);
    await stop();
  });

  test('throws error when removing non-empty directory', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    await expect(fs.rmdir('subdir')).rejects.toThrow();
    await stop();
  });
});

describe('.access()', () => {
  test('can check file access', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    await expect(fs.access('file.txt')).resolves.not.toThrow();
    await stop();
  });

  test('can check directory access', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    await expect(fs.access('subdir')).resolves.not.toThrow();
    await stop();
  });

  test('throws error for non-existent file', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    await expect(fs.access('nonexistent.txt')).rejects.toThrow();
    await stop();
  });
});

describe('.rename()', () => {
  test('can rename file', async () => {
    const {client, stop, vol} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    await fs.rename('file.txt', 'renamed.txt');
    expect(vol.existsSync('/export/file.txt')).toBe(false);
    expect(vol.existsSync('/export/renamed.txt')).toBe(true);
    await stop();
  });

  test('can move file to different directory', async () => {
    const {client, stop, vol} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    await fs.rename('file.txt', 'subdir/moved.txt');
    expect(vol.existsSync('/export/file.txt')).toBe(false);
    expect(vol.existsSync('/export/subdir/moved.txt')).toBe(true);
    await stop();
  });

  test('can rename directory', async () => {
    const {client, stop, vol} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    await fs.mkdir('olddir');
    await fs.rename('olddir', 'newdir');
    expect(vol.existsSync('/export/olddir')).toBe(false);
    expect(vol.existsSync('/export/newdir')).toBe(true);
    await stop();
  });
});

describe('.copyFile()', () => {
  test('can copy file', async () => {
    const {client, stop, vol} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    await fs.copyFile('file.txt', 'copy.txt');
    const original = vol.readFileSync('/export/file.txt', 'utf8');
    const copy = vol.readFileSync('/export/copy.txt', 'utf8');
    expect(copy).toBe(original);
    await stop();
  });

  test('can copy to different directory', async () => {
    const {client, stop, vol} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    await fs.copyFile('file.txt', 'subdir/copy.txt');
    const original = vol.readFileSync('/export/file.txt', 'utf8');
    const copy = vol.readFileSync('/export/subdir/copy.txt', 'utf8');
    expect(copy).toBe(original);
    await stop();
  });
});

describe('.realpath()', () => {
  test('can resolve path', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    const resolved = await fs.realpath('file.txt');
    expect(resolved).toBe('/file.txt');
    await stop();
  });

  test('can resolve nested path', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    const resolved = await fs.realpath('subdir/nested.dat');
    expect(resolved).toBe('/subdir/nested.dat');
    await stop();
  });

  test('can return buffer', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    const resolved = await fs.realpath('file.txt', 'buffer');
    expect(Buffer.isBuffer(resolved)).toBe(true);
    await stop();
  });
});

describe('.symlink()', () => {
  test('can create symbolic link', async () => {
    const {client, stop, vol} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    await fs.symlink('file.txt', 'link.txt');
    const stats = vol.lstatSync('/export/link.txt');
    expect(stats.isSymbolicLink()).toBe(true);
    await stop();
  });

  test('can create link to nested file', async () => {
    const {client, stop, vol} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    await fs.symlink('subdir/nested.dat', 'link-nested.txt');
    const stats = vol.lstatSync('/export/link-nested.txt');
    expect(stats.isSymbolicLink()).toBe(true);
    await stop();
  });
});

describe('.readlink()', () => {
  test('can read symbolic link', async () => {
    const {client, stop, vol} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    vol.symlinkSync('file.txt', '/export/symlink.txt');
    const target = await fs.readlink('symlink.txt');
    expect(target).toBe('file.txt');
    await stop();
  });

  test('can read nested symbolic link', async () => {
    const {client, stop, vol} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    vol.symlinkSync('../file.txt', '/export/subdir/link.txt');
    const target = await fs.readlink('subdir/link.txt');
    expect(target).toBe('../file.txt');
    await stop();
  });
});

describe('.utimes()', () => {
  test('can update file times', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    const atime = new Date('2020-01-01');
    const mtime = new Date('2020-12-31');
    await fs.utimes('file.txt', atime, mtime);
    const stats = await fs.stat('file.txt');
    expect(Math.abs(Number(stats.atimeMs) - atime.getTime())).toBeLessThan(2000);
    expect(Math.abs(Number(stats.mtimeMs) - mtime.getTime())).toBeLessThan(2000);
    await stop();
  });

  test('can update with timestamps', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    const atime = Date.now() - 86400000;
    const mtime = Date.now() - 3600000;
    await fs.utimes('file.txt', atime, mtime);
    const stats = await fs.stat('file.txt');
    expect(Math.abs(Number(stats.atimeMs) - atime)).toBeLessThan(2000);
    expect(Math.abs(Number(stats.mtimeMs) - mtime)).toBeLessThan(2000);
    await stop();
  });
});

describe('.link()', () => {
  test('can create hard link', async () => {
    const {client, stop, vol} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    await fs.link('file.txt', 'hardlink.txt');
    expect(vol.existsSync('/export/hardlink.txt')).toBe(true);
    const stats1 = await fs.stat('file.txt');
    const stats2 = await fs.stat('hardlink.txt');
    expect(stats1.ino).toBe(stats2.ino);
    await stop();
  });

  test('can create link in different directory', async () => {
    const {client, stop, vol} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    await fs.link('file.txt', 'subdir/hardlink.txt');
    expect(vol.existsSync('/export/subdir/hardlink.txt')).toBe(true);
    await stop();
  });
});

describe('.rm()', () => {
  test('can remove a file', async () => {
    const {client, stop, vol} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    await fs.rm('file.txt');
    expect(vol.existsSync('/export/file.txt')).toBe(false);
    await stop();
  });

  test('can remove an empty directory', async () => {
    const {client, stop, vol} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    await fs.mkdir('emptydir');
    await fs.rm('emptydir');
    expect(vol.existsSync('/export/emptydir')).toBe(false);
    await stop();
  });

  test('throws error when removing non-empty directory without recursive', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    await expect(fs.rm('subdir')).rejects.toThrow();
    await stop();
  });

  test('can remove non-empty directory with recursive option', async () => {
    const {client, stop, vol} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    await fs.rm('subdir', {recursive: true});
    expect(vol.existsSync('/export/subdir')).toBe(false);
    await stop();
  });

  test('does not throw with force option on non-existent file', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    await expect(fs.rm('nonexistent.txt', {force: true})).resolves.not.toThrow();
    await stop();
  });

  test('throws error on non-existent file without force', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    await expect(fs.rm('nonexistent.txt')).rejects.toThrow();
    await stop();
  });

  test('can remove nested directory recursively', async () => {
    const {client, stop, vol} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    await fs.mkdir('testdir');
    await fs.mkdir('testdir/subdir1');
    await fs.mkdir('testdir/subdir2');
    await fs.writeFile('testdir/file1.txt', 'content1');
    await fs.writeFile('testdir/subdir1/file2.txt', 'content2');
    await fs.rm('testdir', {recursive: true});
    expect(vol.existsSync('/export/testdir')).toBe(false);
    await stop();
  });
});

describe('.mkdtemp()', () => {
  test('can create temporary directory with prefix', async () => {
    const {client, stop, vol} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    const tmpDir = await fs.mkdtemp('tmp-');
    expect(tmpDir).toMatch(/^tmp-[a-z0-9]{6}$/);
    expect(vol.existsSync('/export/' + tmpDir)).toBe(true);
    const stats = await fs.stat(tmpDir);
    expect(stats.isDirectory()).toBe(true);
    await stop();
  });

  test('creates directory with random suffix', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    const tmpDir1 = await fs.mkdtemp('test-');
    const tmpDir2 = await fs.mkdtemp('test-');
    expect(tmpDir1).not.toBe(tmpDir2);
    await stop();
  });

  test('can create temporary directory with nested prefix', async () => {
    const {client, stop, vol} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    const tmpDir = await fs.mkdtemp('subdir/tmp-');
    expect(tmpDir).toMatch(/^subdir\/tmp-[a-z0-9]{6}$/);
    expect(vol.existsSync('/export/' + tmpDir)).toBe(true);
    await stop();
  });

  test('returns buffer when encoding is buffer', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    const tmpDir = await fs.mkdtemp('tmp-', {encoding: 'buffer'});
    expect(Buffer.isBuffer(tmpDir)).toBe(true);
    await stop();
  });
});

describe('.opendir()', () => {
  test('can open directory and read entries', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    const dir = await fs.opendir('/');
    const entries: string[] = [];
    let entry = await dir.read();
    while (entry !== null) {
      entries.push(entry.name as string);
      entry = await dir.read();
    }
    expect(entries).toContain('file.txt');
    expect(entries).toContain('subdir');
    await dir.close();
    await stop();
  });

  test('can iterate directory with async iterator', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    const dir = await fs.opendir('/');
    const entries: string[] = [];
    for await (const entry of dir) {
      entries.push(entry.name as string);
    }
    expect(entries).toContain('file.txt');
    expect(entries).toContain('subdir');
    await dir.close();
    await stop();
  });

  test('directory entries have correct type information', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    const dir = await fs.opendir('/');
    const entries: any[] = [];
    for await (const entry of dir) {
      entries.push(entry);
    }
    const fileEntry = entries.find((e) => e.name === 'file.txt');
    const dirEntry = entries.find((e) => e.name === 'subdir');
    expect(fileEntry?.isFile()).toBe(true);
    expect(fileEntry?.isDirectory()).toBe(false);
    expect(dirEntry?.isDirectory()).toBe(true);
    expect(dirEntry?.isFile()).toBe(false);
    await dir.close();
    await stop();
  });

  test('can open nested directory', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    const dir = await fs.opendir('subdir');
    const entries: string[] = [];
    for await (const entry of dir) {
      entries.push(entry.name as string);
    }
    expect(entries).toContain('nested.dat');
    await dir.close();
    await stop();
  });

  test('throws error when reading closed directory', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    const dir = await fs.opendir('/');
    await dir.close();
    await expect(dir.read()).rejects.toThrow('Directory is closed');
    await stop();
  });

  test('readSync returns entries correctly', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    const dir = await fs.opendir('/');
    await dir.read();
    const entry = dir.readSync();
    expect(entry).not.toBeNull();
    if (entry) {
      expect(typeof entry.name).toBe('string');
    }
    await dir.close();
    await stop();
  });
});

describe('.chmod()', () => {
  test('can change file mode', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    await fs.chmod('file.txt', 0o644);
    const stats = await fs.stat('file.txt');
    expect(Number(stats.mode) & 0o777).toBe(0o644);
    await stop();
  });

  test('can change directory mode', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    await fs.chmod('subdir', 0o755);
    const stats = await fs.stat('subdir');
    expect(Number(stats.mode) & 0o777).toBe(0o755);
    await stop();
  });

  test('can change nested file mode', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    await fs.chmod('subdir/nested.dat', 0o600);
    const stats = await fs.stat('subdir/nested.dat');
    expect(Number(stats.mode) & 0o777).toBe(0o600);
    await stop();
  });
});

describe('.chown()', () => {
  test('can change file owner', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    await fs.chown('file.txt', 1001, 1001);
    await stop();
  });

  test('can change directory owner', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    await fs.chown('subdir', 1002, 1002);
    await stop();
  });

  test('can change nested file owner', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    await fs.chown('subdir/nested.dat', 1003, 1003);
    await stop();
  });
});

describe('.lchmod()', () => {
  test('can change file mode without following symlinks', async () => {
    const {client, stop, vol} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    vol.symlinkSync('file.txt', '/export/link.txt');
    await fs.lchmod('link.txt', 0o777);
    const stats = await fs.lstat('link.txt');
    expect(stats.isSymbolicLink()).toBe(true);
    await stop();
  });

  test('can change regular file mode with lchmod', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    await fs.lchmod('file.txt', 0o666);
    const stats = await fs.stat('file.txt');
    expect(Number(stats.mode) & 0o777).toBe(0o666);
    await stop();
  });
});

describe('.lchown()', () => {
  test('can change file owner without following symlinks', async () => {
    const {client, stop, vol} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    vol.symlinkSync('file.txt', '/export/link.txt');
    await fs.lchown('link.txt', 2001, 2001);
    await stop();
  });

  test('can change regular file owner with lchown', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    await fs.lchown('file.txt', 2002, 2002);
    await stop();
  });
});

describe('.lutimes()', () => {
  test('can update symlink times without following', async () => {
    const {client, stop, vol} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    vol.symlinkSync('file.txt', '/export/link.txt');
    const now = Date.now();
    const atime = new Date(now - 10000);
    const mtime = new Date(now - 5000);
    await fs.lutimes('link.txt', atime, mtime);
    await stop();
  });

  test('can update regular file times with lutimes', async () => {
    const {client, stop} = await setupNfsClientServerTestbed();
    const fs = new Nfsv4FsClient(client);
    const now = Date.now();
    const atime = new Date(now - 10000);
    const mtime = new Date(now - 5000);
    await fs.lutimes('file.txt', atime, mtime);
    const stats = await fs.stat('file.txt');
    expect(Math.abs(Number(stats.atimeMs) - atime.getTime())).toBeLessThan(2000);
    expect(Math.abs(Number(stats.mtimeMs) - mtime.getTime())).toBeLessThan(2000);
    await stop();
  });
});
