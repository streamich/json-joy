import type {PlatformClipboard} from './types';

class MemBlob {
  private readonly buf: Uint8Array;
  public constructor(data: string | Uint8Array) {
    this.buf = typeof data === 'string' ? new TextEncoder().encode(data) : data;
  }
  public async arrayBuffer(): Promise<ArrayBuffer> {
    return this.buf.buffer.slice(this.buf.byteOffset, this.buf.byteOffset + this.buf.byteLength) as ArrayBuffer;
  }
}

class MemClipboardItem {
  private readonly data: Record<string, Uint8Array> = {};
  public readonly types: string[];

  public constructor(items: Record<string, string | Uint8Array>) {
    const enc = new TextEncoder();
    for (const type in items) {
      const v = items[type];
      this.data[type] = typeof v === 'string' ? enc.encode(v) : v;
    }
    this.types = Object.keys(items);
  }

  public async getType(type: string): Promise<MemBlob> {
    const buf = this.data[type];
    if (!buf) throw new DOMException(`Type ${type} not found`, 'NotFoundError');
    return new MemBlob(buf);
  }
}

export class MemPlatformClipboard implements PlatformClipboard {
  private items: MemClipboardItem[] = [];

  public async writeText(data: string): Promise<void> {
    this.items = [new MemClipboardItem({'text/plain': data})];
  }

  public async write(data: ClipboardItems): Promise<void> {
    this.items = data as unknown as MemClipboardItem[];
  }

  public async read(): Promise<ClipboardItems> {
    return this.items as unknown as ClipboardItems;
  }
}
