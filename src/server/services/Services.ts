import {PresenceService} from './PresenceService';
import {PubsubService} from './PubSubService';
import {BlocksServices} from './blocks/BlocksServices';

export class Services {
  public readonly pubsub: PubsubService;
  public readonly presence: PresenceService;
  public readonly blocks: BlocksServices;

  constructor() {
    this.pubsub = new PubsubService();
    this.presence = new PresenceService();
    this.blocks = new BlocksServices(this);
  }
}
