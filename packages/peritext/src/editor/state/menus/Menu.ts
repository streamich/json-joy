import {BufferMenu} from './BufferMenu';
import {CaretMenu} from './CaretMenu';
import {RangeMenu} from './RangeMenu';
import {BlockMenu} from './BlockMenu';
import {DocMenu} from './DocMenu';
import type {EditorState} from '../EditorState';
import type {UiLifeCycles} from '@jsonjoy.com/ui';

export class Menu implements UiLifeCycles {
  public readonly buffer: BufferMenu;
  public readonly caret: CaretMenu;
  public readonly range: RangeMenu;
  public readonly block: BlockMenu;
  public readonly doc: DocMenu;

  constructor(state: EditorState) {
    this.buffer = new BufferMenu(state);
    this.caret = new CaretMenu(state);
    this.range = new RangeMenu(state);
    this.block = new BlockMenu(state);
    this.doc = new DocMenu(state);
  }

  public start() {
    const stopRangeMenu = this.range.start();
    return () => {
      stopRangeMenu();
    };
  }
}
