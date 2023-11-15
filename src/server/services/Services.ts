import {PresenceService} from './PresenceService';
import {PubsubService} from './PubSubService';
import {BlocksServices} from './blocks/BlocksServices';

export class Services {
  public readonly pubsub: PubsubService;
  public readonly presence: PresenceService;
  public readonly store: BlocksServices;

  constructor() {
    this.pubsub = new PubsubService();
    this.presence = new PresenceService();
    this.store = new BlocksServices(this);
  }
}
