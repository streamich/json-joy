import type {Display} from "./common";
import type {TType} from "./json";

export interface TExample extends Display {
  value: unknown;
}

/**
 * Some reusable resource/entity, analogous to JSON resources or GraphQL types.
 */
export interface TResource extends Display {
  /**
   * ID of this entity.
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
  examples?: TExample[];
}
