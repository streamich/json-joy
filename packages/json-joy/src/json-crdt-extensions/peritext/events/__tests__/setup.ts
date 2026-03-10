import {createEvents} from '..';
import {PeritextCommands} from '../../commands/PeritextCommands';
import type {Kit} from '../../../../json-crdt-extensions/peritext/__tests__/setup';

export const getEventsKit = (getKit: () => Kit) => {
  const kit = getKit();
  const defaults = createEvents(kit.peritext);
  const et = defaults.et;
  const cmd = new PeritextCommands(kit.peritext, et);
  const exec = cmd.exec;
  const run = cmd.run;
  const toHtml = (): string => {
    kit.peritext.refresh();
    const html = defaults.opts.transfer!.toHtml(kit.peritext.rangeAll()!)!;
    return html;
  };
  return {...kit, defaults, et, cmd, exec, run, toHtml};
};
