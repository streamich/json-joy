import {createEvents} from '..';
import type {Kit} from '../../../../json-crdt-extensions/peritext/__tests__/setup';

export const getEventsKit = (getKit: () => Kit) => {
  const kit = getKit();
  const defaults = createEvents(kit.peritext);
  const et = defaults.et;
  const toHtml = (): string => {
    kit.peritext.refresh();
    const html = defaults.opts.transfer!.toHtml(kit.peritext.rangeAll()!)!;
    return html;
  };
  return {...kit, defaults, et, toHtml};
};
