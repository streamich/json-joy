import {PresenceService} from './PresenceService';
import {PubsubService} from './PubSubService';
import {StoreService} from './store/StoreService';

export class Services {
  public readonly pubsub: PubsubService;
  public readonly presence: PresenceService;
  public readonly store: StoreService;

  constructor() {
    this.pubsub = new PubsubService();
    this.presence = new PresenceService();
    this.store = new StoreService(this);
  }
}
