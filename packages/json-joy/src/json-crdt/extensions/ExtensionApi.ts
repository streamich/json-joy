import {ExtApi} from './types';
import {NodeApi} from '../model/api/nodes';
import type {FanOutUnsubscribe} from 'thingies';
import type {ChangeEvent} from '../model/api/events';
import type {ExtNode} from './ExtNode';

export class ExtensionApi<N extends ExtNode<any>> extends NodeApi<N> implements ExtApi<N> {
  /**
   * Attaches a listener which executes on every change that is executed
   * directly on this node. For example, if this is a "str" string node and
   * you insert or delete text, the listener will be executed. Or if
   * this is an "obj" object node and keys of this object are changed, this
   * listener will be executed.
   *
   * It does not trigger when child nodes are edit, to include those changes,
   * use `onSubtreeChange()` or `onChildChange()` methods.
   *
   * @see onChildChange()
   * @see onSubtreeChange()
   *
   * @param listener Callback called on every change that is executed directly
   *     on this node.
   * @returns Returns an unsubscribe function to stop listening to the events.
   */
  public onSelfChange(listener: (event: ChangeEvent) => void): FanOutUnsubscribe {
    return this.api.wrap(this.node.data).onSelfChange(listener);
  }

  /**
   * Attaches a listener which executes on every change that is applied to this
   * node's children. Hence, this listener will trigger only for *container*
   * nodes - nodes that can have child nodes, such as "obj", "arr", "vec", and
   * "val" nodes. It will not execute on changes made directly to this node.
   *
   * If you want to listen to changes on this node as well as its children, use
   * `onSubtreeChange()` method. If you want to listen to changes on this node
   * only, use `onSelfChange()` method.
   *
   * @see onSelfChange()
   * @see onSubtreeChange()
   *
   * @param listener Callback called on every change that is applied to
   *     children of this node.
   * @return Returns an unsubscribe function to stop listening to the events.
   */
  public onChildChange(listener: (event: ChangeEvent) => void): FanOutUnsubscribe {
    return this.api.wrap(this.node.data).onChildChange(listener);
  }

  /**
   * Attaches a listener which executes on every change that is applied to this
   * node or any of its child nodes (recursively). This is equivalent to
   * combining both `onSelfChange()` and `onChildChange()` methods.
   *
   * @see onSelfChange()
   * @see onChildChange()
   *
   * @param listener Callback called on every change that is applied to this
   *     node or any of its child nodes.
   * @return Returns an unsubscribe function to stop listening to the events.
   */
  public onSubtreeChange(listener: (event: ChangeEvent) => void): FanOutUnsubscribe {
    return this.api.wrap(this.node.data).onSubtreeChange(listener);
  }
}
