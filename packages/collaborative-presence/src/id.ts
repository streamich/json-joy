import {type ITimestampStruct, Timestamp} from 'json-joy/lib/json-crdt-patch';
import type {PresenceIdShorthand} from './types';

export const toDto = (sid: number, id: ITimestampStruct): PresenceIdShorthand => {
  const dto: PresenceIdShorthand = [id.time];
  if (id.sid !== sid) dto.push(id.sid);
  return dto;
};

export const fromDto = (sid: number, dto: PresenceIdShorthand): ITimestampStruct => {
  const [time, dtoSid = sid] = dto;
  return new Timestamp(dtoSid, time);
};
