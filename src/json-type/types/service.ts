import type {Display} from "./common";

export interface TService extends Display {
  id: string;
  name: string;
  slug: string;
  services?: TService[];
}
