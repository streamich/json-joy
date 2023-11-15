import {MemoryStore} from './MemoryStore';
import type {Services} from '../Services';

export class StoreService {
  protected readonly store = new MemoryStore();

  constructor(protected readonly services: Services) {}

  async apply(id: string, patches: any[]) {
    const {store} = this;
    const {block} = await store.apply(id, patches);
    return {block};
  }
}
