export enum DefaultRendererColors {
  ActiveCursor = '#07f',
  InactiveCursor = 'rgba(127,127,127,.7)',

  /**
   * Derived from #d7e9fd. 80% opacity used so that
   * any inline formatting underneath the selection
   * is still visible.
   */
  ActiveSelection = 'rgba(196,223,253,.8)',

  InactiveSelection = 'rgba(127,127,127,.2)',
}
