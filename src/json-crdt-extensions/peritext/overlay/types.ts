export type BlockTag = [
  /**
   * Developer specified type of the block. For example, 'title', 'paragraph',
   * 'image', etc. For performance reasons, it is better to use a number to
   * represent the type.
   */
  type: number | number[],

  /**
   * Any custom attributes that the developer wants to add to the block.
   */
  attr?: undefined | unknown,
];
