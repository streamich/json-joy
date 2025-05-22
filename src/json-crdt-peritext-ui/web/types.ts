/**
 * @todo Unify this with {@link UiLifeCycles}, join interfaces.
 * @todo Rename this to something like "disposable", as it does not have to be
 *     a UI component.
 */
export interface UiLifeCycles {
  /**
   * Called when UI component is mounted. Returns a function to be called when
   * the component is removed from the screen.
   */
  start(): () => void;
}

export {Rect} from '../../json-crdt-extensions/peritext/events/defaults/ui/types';
