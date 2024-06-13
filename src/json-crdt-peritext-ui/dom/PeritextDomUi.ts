import type {Peritext} from '../../json-crdt-extensions/peritext/Peritext';
import {Block} from '../../json-crdt-extensions/peritext/block/Block';

export class BlockUi {
  public readonly el: HTMLElement;

  constructor(protected readonly txt: Peritext) {
    this.el = document.createElement('div');
  }

  public refresh(block: Block) {
    this.el.innerHTML = block.text();
  }
}

export class PeritextDomUi {
  protected readonly block: BlockUi;

  constructor(public readonly txt: Peritext) {
    this.block = new BlockUi(txt);
  }

  public render(div: HTMLDivElement) {
    div.appendChild(this.block.el);
  }

  public refresh() {
    const txt = this.txt;
    txt.refresh();
    this.block.refresh(txt.blocks.root);
  }

  protected renderBlock() {

  }
}