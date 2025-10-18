import type {Reader} from '@jsonjoy.com/buffers/lib/Reader';

/**
 * MOUNT protocol structures (Appendix I)
 */

/**
 * File handle for MOUNT protocol (opaque data)
 */
export class MountFhandle3 {
  constructor(public readonly data: Reader) {}
}

/**
 * Mount entry body structure
 */
export class MountBody {
  constructor(
    public readonly hostname: string,
    public readonly directory: string,
    public readonly next?: MountBody,
  ) {}
}

/**
 * Group node for EXPORT
 */
export class MountGroupNode {
  constructor(
    public readonly name: string,
    public readonly next?: MountGroupNode,
  ) {}
}

/**
 * Export node structure
 */
export class MountExportNode {
  constructor(
    public readonly dir: string,
    public readonly groups?: MountGroupNode,
    public readonly next?: MountExportNode,
  ) {}
}
