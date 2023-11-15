export interface StoreBlock {
  id: string;
  seq: number;
  created: number;
  updated: number;
  blob: Uint8Array;
}

export interface StorePatch {
  seq: number;
  created: number;
  blob: Uint8Array;
}

export interface Store {
  create(id: string, patches: StorePatch[]): Promise<StoreApplyResult>;
  get(id: string): Promise<StoreGetResult | undefined>;
  edit(id: string, patches: StorePatch[]): Promise<StoreApplyResult>;
  history(id: string, maxSeq: number, limit: number): Promise<StorePatch[]>;
  remove(id: string): Promise<void>;
}

export interface StoreGetResult {
  block: StoreBlock;
}

export interface StoreApplyResult {
  block: StoreBlock;
}
