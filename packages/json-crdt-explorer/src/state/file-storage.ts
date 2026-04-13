import type {FileMetadataDto, OpenFile} from "./file";
import {gzip} from '@jsonjoy.com/util/lib/compression/gzip';

export interface IFileStorage {
  save(file: OpenFile): Promise<void>;
  load(id: string): Promise<OpenFile>;
  list(): Promise<FileMetadataDto[]>;
  delete(id: string): Promise<void>;
}

export class FileStorage implements IFileStorage {
  async save(file: OpenFile): Promise<void> {
    const {data, ...meta} = file.toDto();
    const compressed = await gzip(data);
    throw new Error('Not implemented');
  }
  
  async load(id: string): Promise<OpenFile> {
    throw new Error('Not implemented');
  }
  
  async list(): Promise<FileMetadataDto[]> {
    throw new Error('Not implemented');
  }
  
  async delete(id: string): Promise<void> {
    throw new Error('Not implemented');
  }
}
