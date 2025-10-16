import type {Expr} from '@jsonjoy.com/json-expression';
import type {Path} from '@jsonjoy.com/json-pointer';
import type {JsonOp, JsonOpDataComponent, JsonOpDropComponent, JsonOpPickComponent} from './types';

const toStringNode = (self: PickNode | DropNode, tab: string = ''): string => {
  let children = '';
  const last = self.children.size - 1;
  let i = 0;
  for (const [_index, node] of self.children) {
    const isLast = i === last;
    children += `\n${tab}${isLast ? ' └─ ' : ' ├─ '}${node.toString(tab + (isLast ? '    ' : ' │  '))}`;
    i++;
  }
  const indexFormatted = typeof self.index === 'number' ? `[${self.index}]` : `"${self.index}"`;
  const registerFormatted =
    (self as PickNode).regId === undefined
      ? ''
      : (self as PickNode).regId === -1
        ? ''
        : ` [${(self as PickNode).regId}]`;
  return `${indexFormatted} ${self.constructor.name}${registerFormatted}${children}`;
};

export class PickNode {
  regId: number;
  index: number | string;
  path: Path;
  pathLength: number;
  parent: PickNode | null;
  children: Map<number | string, PickNode>;

  constructor(index: number | string, path: Path, pathLength: number) {
    this.regId = -1;
    this.index = index;
    this.path = path;
    this.pathLength = pathLength;
    this.parent = null;
    this.children = new Map();
  }

  public toString(tab: string = ''): string {
    return toStringNode(this, tab);
  }
}

export class DropNode {
  regId: number;
  index: number | string;
  path: Path;
  pathLength: number;
  parent: DropNode | null;
  // edits: unknown[] = [];
  children: Map<number | string, DropNode>;

  constructor(index: number | string, path: Path, pathLength: number) {
    this.regId = -1;
    this.index = index;
    this.path = path;
    this.pathLength = pathLength;
    this.parent = null;
    this.children = new Map();
  }

  public toString(tab: string = ''): string {
    return toStringNode(this, tab);
  }

  public clone(): DropNode {
    const clone = new DropNode(this.index, this.path, this.pathLength);
    clone.regId = this.regId;
    for (const [index, node] of this.children) {
      const child = node.clone();
      child.parent = clone;
      clone.children.set(index, child);
    }
    return clone;
  }
}

class PickRoot extends PickNode {
  constructor() {
    super(0, [], 0);
  }
}

class DropRoot extends DropNode {
  constructor() {
    super(0, [], 0);
  }
}

export class Register {
  public pick: PickNode | null = null;
  public data: unknown = undefined;
  public readonly drops: DropNode[] = [];
  constructor(public readonly id: number) {}

  addDrop(drop: DropNode) {
    this.drops.push(drop);
  }

  removeDrop(drop: DropNode) {
    const index = this.drops.indexOf(drop);
    if (index > -1) this.drops.splice(index, 1);
  }

  toString() {
    let drops = '';
    if (this.drops.length)
      drops = this.drops.map((drop) => '/' + drop.path.slice(0, drop.pathLength).join('/')).join(', ');
    const src = this.pick
      ? '/' + this.pick.path.slice(0, this.pick.pathLength).join('/')
      : `{ ${JSON.stringify(this.data)} }`;
    const dst = drops ? `{ ${drops} }` : '∅';
    return `${this.id}: Register ${src} ┈┈┈→ ${dst}`;
  }
}

export class OpTree {
  public static from(op: JsonOp): OpTree {
    const [test, pick = [], data = [], drop = [], _edit = []] = op;
    const tree = new OpTree();
    if (test.length) tree.test.push(...test);
    for (let i = 0; i < pick.length; i++) {
      const [registerId, what] = pick[i];
      tree.addPickNode(registerId, what);
    }
    for (let i = 0; i < data.length; i++) {
      const [registerId, value] = data[i];
      tree.addData(registerId, value);
    }
    for (let i = 0; i < drop.length; i++) {
      const [registerId, where] = drop[i];
      tree.addDropNode(registerId, where);
    }
    return tree;
  }

  protected maxRegId = -1;
  public test: Expr[] = [];
  public pick: PickNode = new PickRoot();
  public drop: DropNode = new DropRoot();
  public register = new Map<number, Register>();

  findPick(path: Path, pathLength: number): PickNode | undefined {
    let parent: PickNode | undefined = this.pick;
    for (let i = 0; i < pathLength; i++) {
      const index = path[i];
      if (!parent.children.has(index)) return undefined;
      parent = parent.children.get(index)!;
    }
    return parent;
  }

  findDrop(path: Path, pathLength: number): DropNode | undefined {
    let parent: DropNode | undefined = this.drop;
    for (let i = 0; i < pathLength; i++) {
      const index = path[i];
      if (!parent.children.has(index)) return undefined;
      parent = parent.children.get(index)!;
    }
    return parent;
  }

  protected setRegister(register: Register): void {
    const regId = register.id;
    if (regId > this.maxRegId) this.maxRegId = regId;
    this.register.set(regId, register);
  }

  addPickNode(registerId: number, what: Path, length: number = what.length): Register {
    let parent: PickNode = this.pick;
    if (!length) {
      parent.regId = registerId;
      const register = new Register(registerId);
      register.pick = parent;
      this.setRegister(register);
    } else {
      for (let i = 0; i < length; i++) {
        const index = what[i];
        const childExists = parent.children.has(index);
        if (!childExists) {
          const child = new PickNode(index, what, i + 1);
          parent.children.set(index, child);
          child.parent = parent;
        }
        const child = parent.children.get(index)!;
        const isLast = i === length - 1;
        if (isLast) {
          if (child.regId < 0) {
            child.regId = registerId;
            const register = new Register(registerId);
            register.pick = child;
            this.setRegister(register);
          }
        }
        parent = child;
      }
    }
    return this.register.get(parent.regId)!;
  }

  addData(registerId: number, data: unknown) {
    const register = new Register(registerId);
    register.data = data;
    this.setRegister(register);
  }

  addDropNode(registerId: number, where: Path) {
    let parent: DropNode = this.drop;
    const length = where.length;
    if (!length) {
      const register = this.register.get(registerId);
      if (register instanceof Register) {
        parent.regId = register.id;
        register.addDrop(parent);
      }
    } else {
      for (let i = 0; i < length; i++) {
        const index = where[i];
        const childExists = parent.children.has(index);
        if (!childExists) {
          const child = new DropNode(index, where, i + 1);
          parent.children.set(index, child);
          child.parent = parent;
        }
        const child = parent.children.get(index)!;
        const isLast = i === length - 1;
        if (isLast) {
          child.regId = registerId;
          const register = this.register.get(registerId)!;
          register.addDrop(child);
        }
        parent = child;
      }
    }
  }

  /**
   * Composes two operations into one combined operation. This object contains
   * the result of the composition. During the composition, both operations
   * are mutated in place, hence the `other` becomes unusable after the call.
   *
   * @param other another OpTree
   */
  public compose(other: OpTree): void {
    this.test.push(...other.test);
    // Compose deletes.
    const d1: DropNode = this.drop;
    const d2: DropNode = other.drop;
    other.register.forEach((register2) => {
      // Update pick path.
      if (register2.pick) {
        let path = register2.pick.path;
        let pathLength = register2.pick.pathLength;
        const deepestDropNodeInPath = this.findDeepestDropInPath(register2.pick.path, register2.pick.pathLength);
        if (deepestDropNodeInPath) {
          if (deepestDropNodeInPath) {
            const dropRegister = this.register.get(deepestDropNodeInPath.regId)!;
            if (dropRegister.pick) {
              path = [
                ...dropRegister.pick.path.slice(0, dropRegister.pick.pathLength),
                ...register2.pick.path.slice(0, register2.pick.pathLength).slice(deepestDropNodeInPath.pathLength),
              ];
              pathLength = path.length;
              register2.pick.path = path;
              register2.pick.pathLength = pathLength;
            }
          }
        }
        for (let i = 0; i < pathLength; i++) {
          const comp = path[i];
          if (typeof comp === 'number') {
            const pick = this.findPick(path, i);
            if (pick) {
              let numberOfPickWithLowerIndex = 0;
              pick.children.forEach((child, index) => {
                if (+index <= comp) numberOfPickWithLowerIndex++;
              });
              (path as any)[i] += numberOfPickWithLowerIndex;
            }
          }
        }
        const isDelete = !register2.drops.length;
        if (isDelete) {
          const op1Pick = this.findPick(register2.pick.path, register2.pick.pathLength);
          if (op1Pick && op1Pick.regId) {
            const register = this.register.get(op1Pick.regId);
            const alreadyDeletedInOp1 = register && !register.drops.length;
            if (alreadyDeletedInOp1) return;
          }
          this.addPickNode(this.maxRegId + 1, path, pathLength);
          const drop = this.findDrop(register2.pick.path, register2.pick.pathLength);
          if (drop) {
            if (drop.parent) {
              drop.parent.children.delete(drop.index);
              drop.parent = null;
              const register1 = this.register.get(drop.regId);
              if (register1 instanceof Register) {
                register1.removeDrop(drop);
                if (!register1.drops.length && !register1.pick) this.register.delete(drop.regId);
              }
            } else {
              this.drop.regId = -1;
            }
          }
        }
      }
    });
    this.composeDrops(d1, d2, other);
  }

  protected findDeepestDropInPath(path: Path, pathLength: number = path.length): DropNode | null {
    let longest: DropNode | null = null;
    let curr = this.drop;
    for (let i = 0; i < pathLength; i++) {
      const comp = path[i];
      const child = curr.children.get(comp);
      if (!child) break;
      curr = child;
      if (curr.regId >= 0) longest = curr;
    }
    return longest;
  }

  protected removeDrop(drop: DropNode): void {
    if (drop.regId >= 0) {
      const register = this.register.get(drop.regId)!;
      register.removeDrop(drop);
      if (!register.drops.length && !register.pick) this.register.delete(drop.regId);
    }
  }

  protected composeDrops(d1: DropNode, d2: DropNode, tree2: OpTree): void {
    const isDrop = d2.regId >= 0;
    if (isDrop) {
      const isRoot = !d2.parent;
      const clone = !isRoot ? d2.clone() : this.drop;
      const register2 = tree2.register.get(d2.regId)!;
      const isDataDrop = register2.data !== undefined;
      if (isDataDrop) {
        const newRegister = new Register(this.maxRegId + 1);
        newRegister.data = register2.data;
        newRegister.addDrop(clone);
        this.setRegister(newRegister);
        clone.regId = newRegister.id;
      } else {
        const samePickInOp1Exists = this.findPick(register2.pick!.path, register2.pick!.pathLength);
        if (samePickInOp1Exists) {
          clone.regId = samePickInOp1Exists.regId;
        } else {
          const reg = this.addPickNode(this.maxRegId + 1, register2.pick!.path, register2.pick!.pathLength);
          reg.addDrop(clone);
          clone.regId = reg.id;
        }
      }
      if (!!d1.parent && !!d2.parent) {
        const child = d1.parent.children.get(d1.index);
        if (child) this.removeDrop(child);
        d1.parent.children.set(d2.index, clone);
      }
    }
    for (const [index, child2] of d2.children) {
      if (!d1.children.has(index)) {
        const child1 = new DropNode(child2.index, child2.path, child2.pathLength);
        child1.parent = d1;
        d1.children.set(child1.index, child1);
      }
      const child1 = d1.children.get(index)!;
      this.composeDrops(child1, child2, tree2);
    }
  }

  public toJson(): JsonOp {
    const pick: JsonOpPickComponent[] = [];
    const data: JsonOpDataComponent[] = [];
    const drop: JsonOpDropComponent[] = [];
    for (const [index, register] of this.register) {
      if (register.data !== undefined) {
        data.push([index, register.data]);
      } else {
        const pickPath = register.pick!.path;
        const pickPathLength = register.pick!.pathLength;
        pick.push([index, pickPath.slice(0, pickPathLength)]);
      }
    }
    this.pushDropNode(drop, this.drop);
    return [this.test, pick, data, drop, []];
  }

  protected pushDropNode(drop: JsonOpDropComponent[], node: DropNode): void {
    if (node.regId >= 0) drop.push([node.regId, node.path.slice(0, node.pathLength)]);
    node.children.forEach((child) => {
      this.pushDropNode(drop, child);
    });
  }

  public toString(tab: string = ''): string {
    const picks = this.pick ? this.pick.toString(tab + '│  ') : ' ∅';
    let registers = 'Registers';
    const lastRegister = this.register.size - 1;
    let i = 0;
    for (const [_id, register] of this.register) {
      const isLast = i === lastRegister;
      registers += `\n${tab}${isLast ? '│  └─' : '│  ├─'} ${register}`;
      i++;
    }
    const drops = this.drop ? this.drop.toString(tab + '   ') : ' ∅';
    return `OpTree\n${tab}├─ ${picks}\n${tab}│\n${tab}├─ ${registers}\n${tab}│\n${tab}└─ ${drops}`;
  }
}
