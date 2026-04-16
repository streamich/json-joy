import {gzip, ungzip} from '@jsonjoy.com/util/lib/compression/gzip';
import {FileMetadataDto, FileDto, OpenFile} from "./file";
import {Log} from '../components/MainContent/Log';

export interface IFileStorage {
  save(file: OpenFile): Promise<void>;
  load(id: string): Promise<FileDto>;
  list(): Promise<FileMetadataDto[]>;
  delete(id: string): Promise<void>;
}

const ROOT = 'explorer.jsoncrdt.org';
const FILES_DIR = 'files';
const META_FILENAME = 'meta.json';
const DATA_FILENAME = 'data.seq.cbor.gz';

async function getFilesDir(): Promise<FileSystemDirectoryHandle> {
  const opfs = await navigator.storage.getDirectory();
  const root = await opfs.getDirectoryHandle(ROOT, {create: true});
  return root.getDirectoryHandle(FILES_DIR, {create: true});
}

export class FileStorage implements IFileStorage {
  async save(file: OpenFile): Promise<void> {
    const {data, ...meta} = file.toDto();
    const compressed = await gzip(data);
    const filesDir = await getFilesDir();
    const fileDir = await filesDir.getDirectoryHandle(meta.id, {create: true});

    const metaHandle = await fileDir.getFileHandle(META_FILENAME, {create: true});
    const metaWriter = await metaHandle.createWritable();
    await metaWriter.write(JSON.stringify(meta));
    await metaWriter.close();

    const dataHandle = await fileDir.getFileHandle(DATA_FILENAME, {create: true});
    const dataWriter = await dataHandle.createWritable();
    await dataWriter.write(compressed as any);
    await dataWriter.close();
  }

  async load(id: string): Promise<FileDto> {
    const filesDir = await getFilesDir();
    const fileDir = await filesDir.getDirectoryHandle(id);

    const metaHandle = await fileDir.getFileHandle(META_FILENAME);
    const metaFile = await metaHandle.getFile();
    const meta: FileDto = JSON.parse(await metaFile.text());

    const dataHandle = await fileDir.getFileHandle(DATA_FILENAME);
    const dataFile = await dataHandle.getFile();
    const compressed = new Uint8Array(await dataFile.arrayBuffer());
    meta.data = await ungzip(compressed);

    return meta;
  }

  // async open(id: string): Promise<OpenFile> {
  //   const dto = await this.load(id);
  //   return OpenFile.fromDto(dto);
  // }

  async list(): Promise<FileMetadataDto[]> {
    const filesDir = await getFilesDir();
    const results: FileMetadataDto[] = [];
    for await (const [, entry] of (filesDir as any)) {
      if (entry.kind !== 'directory') continue;
      try {
        const metaHandle = await entry.getFileHandle(META_FILENAME);
        const metaFile = await metaHandle.getFile();
        const meta: FileMetadataDto = JSON.parse(await metaFile.text());
        results.push(meta);
      } catch {
        // skip folders without a valid meta.json
      }
    }
    return results;
  }

  async delete(id: string): Promise<void> {
    const filesDir = await getFilesDir();
    await filesDir.removeEntry(id, {recursive: true});
  }
}
