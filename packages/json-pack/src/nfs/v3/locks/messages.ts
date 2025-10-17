import type {Nlm4Stat} from './constants';
import type {Reader} from '@jsonjoy.com/buffers/lib/Reader';
import type * as stucts from './structs';

/**
 * Network Lock Manager (NLM) protocol messages (Appendix II)
 */

export type NlmMessage = NlmRequest | NlmResponse;

export type NlmRequest =
  | Nlm4TestRequest
  | Nlm4LockRequest
  | Nlm4CancelRequest
  | Nlm4UnlockRequest
  | Nlm4GrantedRequest
  | Nlm4ShareRequest
  | Nlm4UnshareRequest
  | Nlm4NmLockRequest
  | Nlm4FreeAllRequest;

export type NlmResponse = Nlm4TestResponse | Nlm4Response | Nlm4ShareResponse;

/**
 * TEST request arguments
 */
export class Nlm4TestArgs {
  constructor(
    public readonly cookie: Reader,
    public readonly exclusive: boolean,
    public readonly lock: stucts.Nlm4Lock,
  ) {}
}

/**
 * TEST request
 */
export class Nlm4TestRequest {
  constructor(public readonly args: Nlm4TestArgs) {}
}

/**
 * TEST response - denied case
 */
export class Nlm4TestDenied {
  constructor(public readonly holder: stucts.Nlm4Holder) {}
}

/**
 * TEST response
 */
export class Nlm4TestResponse {
  constructor(
    public readonly cookie: Reader,
    public readonly stat: Nlm4Stat,
    public readonly holder?: stucts.Nlm4Holder,
  ) {}
}

/**
 * LOCK request arguments
 */
export class Nlm4LockArgs {
  constructor(
    public readonly cookie: Reader,
    public readonly block: boolean,
    public readonly exclusive: boolean,
    public readonly lock: stucts.Nlm4Lock,
    public readonly reclaim: boolean,
    public readonly state: number,
  ) {}
}

/**
 * LOCK request
 */
export class Nlm4LockRequest {
  constructor(public readonly args: Nlm4LockArgs) {}
}

/**
 * Generic NLM response
 */
export class Nlm4Response {
  constructor(
    public readonly cookie: Reader,
    public readonly stat: Nlm4Stat,
  ) {}
}

/**
 * CANCEL request arguments
 */
export class Nlm4CancelArgs {
  constructor(
    public readonly cookie: Reader,
    public readonly block: boolean,
    public readonly exclusive: boolean,
    public readonly lock: stucts.Nlm4Lock,
  ) {}
}

/**
 * CANCEL request
 */
export class Nlm4CancelRequest {
  constructor(public readonly args: Nlm4CancelArgs) {}
}

/**
 * UNLOCK request arguments
 */
export class Nlm4UnlockArgs {
  constructor(
    public readonly cookie: Reader,
    public readonly lock: stucts.Nlm4Lock,
  ) {}
}

/**
 * UNLOCK request
 */
export class Nlm4UnlockRequest {
  constructor(public readonly args: Nlm4UnlockArgs) {}
}

/**
 * GRANTED request
 */
export class Nlm4GrantedRequest {
  constructor(public readonly args: Nlm4TestArgs) {}
}

/**
 * SHARE request arguments
 */
export class Nlm4ShareArgs {
  constructor(
    public readonly cookie: Reader,
    public readonly share: stucts.Nlm4Share,
    public readonly reclaim: boolean,
  ) {}
}

/**
 * SHARE request
 */
export class Nlm4ShareRequest {
  constructor(public readonly args: Nlm4ShareArgs) {}
}

/**
 * SHARE response
 */
export class Nlm4ShareResponse {
  constructor(
    public readonly cookie: Reader,
    public readonly stat: Nlm4Stat,
    public readonly sequence: number,
  ) {}
}

/**
 * UNSHARE request
 */
export class Nlm4UnshareRequest {
  constructor(public readonly args: Nlm4ShareArgs) {}
}

/**
 * NM_LOCK request
 */
export class Nlm4NmLockRequest {
  constructor(public readonly args: Nlm4LockArgs) {}
}

/**
 * FREE_ALL request
 */
export class Nlm4FreeAllRequest {
  constructor(public readonly notify: stucts.Nlm4Notify) {}
}
