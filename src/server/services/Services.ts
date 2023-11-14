import {PresenceService} from './PresenceService';
import {PubsubService} from './PubSubService';

export class Services {
  public readonly pubsub = new PubsubService();
  public readonly presence = new PresenceService();
}
