import type {Operation} from 'json-joy/lib/json-patch';

export type OnChange = (patch: Operation[]) => void;
