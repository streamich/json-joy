export const enum FeedOpType {
  Insert = 0,
  Delete = 1,
}

export const enum FeedConstraints {
  /**
   * Number of ops per frame that triggers a new frame creation.
   */
  DefaultOpsPerFrameThreshold = 25,

  FirstFrameSeq = 0,
}
