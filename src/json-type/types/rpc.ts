import type {Display} from "./common";
import type {TType} from "./json";

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
 * An interface of a single argument RPC function. A function has a
 * single `req` request payload, and a single `res` response payload.
 * When error happens, the function responds with `err` payload.
 */
export interface TFunctionDefinition {
  req?: TResource;
  res?: TResource;
  err?: TResource;
}

/**
 * Represents an RPC function.
 */
export interface TFunction extends TFunctionDefinition, Display {
  /**
   * Unique ID of this function. I.e. the function name, function symbol.
   */
  id: string;

  /**
   * List of examples of how the function could be called.
   */
  examples?: TFunctionExample[];

  // authentication?: string;
  // authorization?: string;
}

/**
 * Some reusable resource/entity, analogous to JSON resources or GraphQL types.
 */
export interface TResource extends Display {
  /**
   * ID of this resource.
   */
  id: string;

  /**
   * ID of the service to which this entity belongs, if any. Entities could
   * be reused across services.
   */
  service?: string;

  /**
   * Schema of the entity.
   */
  type: TType;

  /**
   * Various examples of how the resource could look.
   */
  examples?: TResourceExample[];
}

/**
 * An example of how a resource could look.
 */
export interface TResourceExample extends Display {
  value: unknown;
}

/**
 * Represents a service or a product.
 */
export interface TService extends Display {
  id: string;
  name: string;
  slug: string;
  services?: TService[];
}
