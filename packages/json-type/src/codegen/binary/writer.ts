import {Writer} from '@jsonjoy.com/buffers/lib/Writer';

// Using a very small buffer size (1 byte) to expose capacity estimation bugs
// and stale buffer reference issues. The default was 64KB which masked these problems.
export const writer = new Writer(1);
