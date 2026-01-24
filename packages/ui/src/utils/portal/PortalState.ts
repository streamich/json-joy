export class PortalState {
  /**
   * The parent portal in the portal tree.
   */
  public parent: PortalState | null = null;

  /**
   * Collection of all children portals in this sub-tree.
   */
  public roots = new Set<HTMLElement>();

  public addRoot(root: HTMLElement) {
    this.roots.add(root);
    if (this.parent) this.parent.addRoot(root);
  }

  public delRoot(root: HTMLElement) {
    this.roots.delete(root);
    if (this.parent) this.parent.delRoot(root);
  }
}
