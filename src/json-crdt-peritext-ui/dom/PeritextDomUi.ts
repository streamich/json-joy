import type {Peritext} from '../../json-crdt-extensions/peritext/Peritext';

export class PeritextDomUi {
  constructor(public readonly txt: Peritext) {}

  public render(div: HTMLDivElement) {
    const txt = this.txt;
    txt.refresh();
    console.log(txt + '');
    div.innerHTML = this.txt.strApi().view();
  }

  protected renderBlock() {

  }
}