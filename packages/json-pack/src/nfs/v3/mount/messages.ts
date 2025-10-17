import type {MountStat} from './constants';
import type * as stucts from './structs';

/**
 * MOUNT protocol messages (Appendix I)
 */

export type MountMessage = MountRequest | MountResponse;

export type MountRequest =
  | MountMntRequest
  | MountUmntRequest
  | MountDumpRequest
  | MountUmntallRequest
  | MountExportRequest;

export type MountResponse = MountMntResponse | MountDumpResponse | MountExportResponse;

/**
 * MNT request
 */
export class MountMntRequest {
  constructor(public readonly dirpath: string) {}
}

/**
 * MNT response - success case
 */
export class MountMntResOk {
  constructor(
    public readonly fhandle: stucts.MountFhandle3,
    public readonly authFlavors: number[],
  ) {}
}

/**
 * MNT response
 */
export class MountMntResponse {
  constructor(
    public readonly status: MountStat,
    public readonly mountinfo?: MountMntResOk,
  ) {}
}

/**
 * DUMP request (void - no arguments)
 */
export class MountDumpRequest {}

/**
 * DUMP response
 */
export class MountDumpResponse {
  constructor(public readonly mountlist?: stucts.MountBody) {}
}

/**
 * UMNT request
 */
export class MountUmntRequest {
  constructor(public readonly dirpath: string) {}
}

/**
 * UMNTALL request (void - no arguments)
 */
export class MountUmntallRequest {}

/**
 * EXPORT request (void - no arguments)
 */
export class MountExportRequest {}

/**
 * EXPORT response
 */
export class MountExportResponse {
  constructor(public readonly exports?: stucts.MountExportNode) {}
}
