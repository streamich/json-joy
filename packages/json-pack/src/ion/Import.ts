import {type AstNode, ObjAstNode, toAst} from './ast';
import type {SymbolTable} from './types';

export class Import {
  public readonly offset: number;
  public length: number;
  protected readonly byText = new Map<string, number>();

  constructor(
    public readonly parent: Import | null,
    public readonly symbols: SymbolTable,
  ) {
    this.offset = parent ? parent.offset + parent.length : 1;
    this.length = symbols.length;
    for (let i = 0; i < symbols.length; i++) {
      const symbol = symbols[i];
      this.byText.set(symbol, this.offset + i);
    }
  }

  public getId(symbol: string): number | undefined {
    const id = this.byText.get(symbol);
    if (id !== undefined) return id;
    if (this.parent) this.parent.getId(symbol);
    return undefined;
  }

  public getText(id: number): string | undefined {
    if (id < this.offset) return this.parent ? this.parent.getText(id) : undefined;
    return this.symbols[id - this.offset];
  }

  public add(symbol: string): number {
    let id = this.byText.get(symbol);
    if (id !== undefined) return id;
    const length = this.symbols.length;
    id = this.offset + length;
    this.symbols.push(symbol);
    this.length++;
    this.byText.set(symbol, id);
    return id;
  }

  public toAst(): ObjAstNode {
    const map = new Map<number, AstNode<unknown>>();
    map.set(7, toAst(this.symbols, this));
    return new ObjAstNode(map);
  }
}
