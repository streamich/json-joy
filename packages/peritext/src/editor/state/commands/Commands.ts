import {cmds as rangeCommands} from './range';
import type {DynamicCommandDefinition} from './types';
import type {EditorState} from '../EditorState';
import type {UiLifeCycles} from '@jsonjoy.com/ui/lib/types';
import type {MenuItem} from '../../types';

export class Commands implements UiLifeCycles {
  public readonly byName: Record<string, DynamicCommandDefinition> = {};
  public readonly range: DynamicCommandDefinition[] = [];

  constructor(public readonly state: EditorState) {}

  public start() {
    for (const cmd of rangeCommands) this.register(cmd);
    return () => {};
  }

  public register(cmd: DynamicCommandDefinition) {
    const menu = cmd(this.state);
    this.byName[menu.cmd ?? menu.name] = cmd;
    if (menu.domain === 'range') this.range.push(cmd);
  }

  public run(name: string, ...args: any[]): Promise<unknown> | unknown {
    const cmdDef = this.byName[name];
    if (!cmdDef) throw new Error(`Command not found: ${name}`);
    const cmd = cmdDef(this.state);
    return cmd.action(this.state, args);
  }

  // -------------------------------------------------------------------- menus

  private buildGroups(path: string[], groups: Record<string, MenuItem>): MenuItem {
    let groupKey = '';
    const length = path.length;
    let parent: MenuItem = groups['']!;
    for (let i = 0; i < length; i++) {
      const name = path[i];
      groupKey += (i > 0 ? ':' : '') + name;
      let group = groups[groupKey];
      if (!group) {
        group = groups[groupKey] = {
          name,
          expand: 0,
          minWidth: 300,
          children: [],
        };
        parent.children?.push(group);
      }
      parent = group;
    }
    return groups[groupKey]!;
  }

  public buildRangeMenu(name: string = 'Commands'): MenuItem {
    const root: MenuItem = {
      name,
      expand: 0,
      sepBefore: true,
      minWidth: 300,
      children: [],
    };
    const groups: Record<string, MenuItem> = {'': root};
    const state = this.state;
    const commands = this.range;
    const length = commands.length;
    for (let i = 0; i < length; i++) {
      const item = commands[i](state);
      let container: MenuItem = root;
      if (item.group) container = this.buildGroups(item.group, groups);
      const {onSelect, action, params} = item;
      if (!onSelect && action) {
        item.onSelect = () => {
          action?.(this.state, []);
        };
      }
      if (params && params.length) {
        item.more = true;
        item.onSubmit = (list) => {
          const args: string[] = list.map(([_, value]) => value + '');
          action?.(this.state, args);
        };
      }
      container.children!.push(item);
    }
    for (const group of Object.values(groups)) {
      if (group.children)
        group.children.sort((a, b) => {
          if (!a.children && b.children) return -1;
          if (a.children && !b.children) return 1;
          return a.name > b.name ? 1 : -1;
        });
    }
    return root;
  }
}
