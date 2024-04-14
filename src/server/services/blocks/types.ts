export interface StoreModel {
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
  /**
   * Create a new block.
   *
   * @param id Block ID.
   * @param patches Initial patches to apply to a new block.
   * @returns Newly created block data.
   */
  create(id: string, model: StoreModel, patches: StorePatch[]): Promise<void>;

  /**
   * Retrieve an existing block.
   *
   * @param id Block ID.
   * @returns Block data, or `undefined` if the block does not exist.
   */
  get(id: string): Promise<StoreGetResult | undefined>;

  /**
   * Retrieve the sequence number of a block.
   *
   * @param id Block ID.
   * @returns Block sequence number, or `undefined` if the block does not exist.
   */
  seq(id: string): Promise<number | undefined>;

  /**
   * Edit an existing block by applying new patches.
   *
   * @param id Block ID.
   * @param patches Patches to apply to the block.
   * @returns Updated block data.
   */
  edit(id: string, patches: StorePatch[]): Promise<StoreApplyResult>;

  /**
   * Retrieve the history of patches for a block.
   *
   * @param id Block ID.
   * @param min Minimum sequence number.
   * @param max Maximum sequence number.
   * @returns List of patches.
   */
  history(id: string, min: number, max: number): Promise<StorePatch[]>;

  /**
   * Remove a block.
   *
   * @param id Block ID.
   * @returns `true` if the block was removed, `false` if the block did not exist.
   */
  remove(id: string): Promise<boolean>;
}

export interface StoreGetResult {
  model: StoreModel;
}

export interface StoreApplyResult {
  model: StoreModel;
}
