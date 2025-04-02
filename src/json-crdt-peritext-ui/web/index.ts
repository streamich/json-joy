import {Peritext} from "../../json-crdt-extensions";
import {PeritextSurfaceState} from "./react";
import {createEvents as createEvents} from "../events";

export const create = (events: PeritextEventDefaults) => {
  const state = new PeritextSurfaceState(events.txt, events, rerender, plugins);
  // onState?.(state);
  // if (dom && dom.opts.source === el) return;
  const newDom = new DomController({source: el, events: state.events, log: state.log});
  const txt = state.peritext;
  const uiHandle = new UiHandle(txt, newDom);
  state.events.ui = uiHandle;
  state.events.undo = newDom.annals;
  newDom.start();
  state.dom = newDom;
  setDom(newDom);
  newDom.et.addEventListener('change', rerender);
};
