import type {Display, Identifiable} from './common';

/**
 * Represents an RPC function.
 */
export interface TFunction extends Display, Identifiable {
  /**
   * Unique ID of this function. I.e. the function name, function symbol.
   */
  id: string;

  req: string;
  res: string;
  err: string;

  /**
   * List of examples of how the function could be called.
   */
  examples?: TFunctionExample[];
}

/**
 * An example of a single argument RPC function call.
 */
export interface TFunctionExample extends Display {
  /** Example request data. */
  req?: unknown;
  /** Example response data. */
  res?: unknown;
  /** Example error response data. */
  err?: unknown;
}

/**
 * Represents a service or a product.
 */
export interface TService extends Display, Identifiable {
  name: string;
  slug: string;
  services?: TService[];
}
