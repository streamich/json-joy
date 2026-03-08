import type {PeritextDefaultCommands} from './default';

export type CommandBase<Name extends string, Args extends any[] = any[]> = [name: Name, ...args: Args];

export type DefaultCommandNames = keyof PeritextDefaultCommands;
export type DefaultCommands = {
  [K in DefaultCommandNames]: PeritextDefaultCommands[K] extends (...args: infer Args) => any
    ? CommandBase<K, Args>
    : never;
};
export type DefaultCommand = DefaultCommands[DefaultCommandNames];

export type PeritextCommand = DefaultCommand | CommandBase<string, any[]>;
