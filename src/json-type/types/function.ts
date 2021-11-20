import type {Display} from "./common";
import {TResource} from "./resource";

export interface TFunctionExample extends Display {
  req?: unknown;
  res?: unknown;
  err?: unknown;
}

export interface TFunctionDefinition {
  req?: TResource[];
  res?: TResource[];
  err?: TResource[];
}

export interface TFunction extends TFunctionDefinition, Display {
  id: string;
  examples?: TFunctionExample[];
  authentication?: string;
  authorization?: string;
}
