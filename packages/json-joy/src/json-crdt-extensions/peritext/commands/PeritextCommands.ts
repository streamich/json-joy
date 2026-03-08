import {CommandsImpl, type PeritextDefaultCommands} from './default';
import type {PeritextCommand} from './types';
import type {Peritext} from '../Peritext';
import type {PeritextEventTarget} from '../events/PeritextEventTarget';

export class PeritextCommands {
  public readonly def: CommandsImpl;
  public readonly extra = new Map<string, (...args: any[]) => void>();

  constructor(
    public readonly txt: Peritext,
    public readonly et: PeritextEventTarget,
  ) {
    this.def = new CommandsImpl(txt, et);
  }

  public readonly exec: {
    <Name extends keyof PeritextDefaultCommands>(
      name: Name,
      ...args: Parameters<PeritextDefaultCommands[Name]>
    ): unknown;
    (name: string, ...args: any[]): unknown;
  } = (name: string, ...args: any[]): unknown => {
    if (typeof this.def[name as keyof PeritextDefaultCommands] === 'function')
      return (this.def[name as keyof PeritextDefaultCommands] as any)(...args);
    const cmd = this.extra.get(name);
    if (!cmd) throw new Error(`Command ${name} not found`);
    return cmd(...args);
  };

  public readonly run = (cmds: PeritextCommand | PeritextCommand[]): unknown => {
    if (!Array.isArray(cmds[0])) cmds = [cmds as PeritextCommand];
    const {txt} = this;
    let result: unknown;
    for (const [name, ...args] of cmds) {
      result = this.exec(name, ...args);
      txt.refresh();
    }
    return result;
  };
}
