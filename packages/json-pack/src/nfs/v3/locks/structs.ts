import type {Reader} from '@jsonjoy.com/buffers/lib/Reader';

/**
 * Network Lock Manager (NLM) protocol structures (Appendix II)
 */

/**
 * NLM lock holder structure
 */
export class Nlm4Holder {
  constructor(
    public readonly exclusive: boolean,
    public readonly svid: number,
    public readonly oh: Reader,
    public readonly offset: bigint,
    public readonly length: bigint,
  ) {}
}

/**
 * NLM lock structure
 */
export class Nlm4Lock {
  constructor(
    public readonly callerName: string,
    public readonly fh: Reader,
    public readonly oh: Reader,
    public readonly svid: number,
    public readonly offset: bigint,
    public readonly length: bigint,
  ) {}
}

/**
 * NLM share structure
 */
export class Nlm4Share {
  constructor(
    public readonly callerName: string,
    public readonly fh: Reader,
    public readonly oh: Reader,
    public readonly mode: number,
    public readonly access: number,
  ) {}
}

/**
 * NLM notify structure
 */
export class Nlm4Notify {
  constructor(
    public readonly name: string,
    public readonly state: number,
  ) {}
}
