/** Must be positive integer. */
export type Id = number;

/** Must be non-empty string, no longer than 128 characters. */
export type Name = string;

export type CompactNotificationMessage<Data = unknown> = [Name] | [Name, Data];

export type CompactRequestCompleteMessage<Data = unknown> = [Id, Name] | [Id, Name, Data];
export type CompactRequestDataMessage<Data = unknown> = [Id, 0, Name] | [Id, 0, Name, Data];
export type CompactRequestErrorMessage<Data = unknown> = [Id, 1, Name, Data];
export type CompactRequestUnsubscribeMessage = [Id, 2];

export type CompactResponseCompleteMessage<Data = unknown> = [0, Id] | [0, Id, Data];
export type CompactResponseErrorMessage<Data = unknown> = [-1, Id, Data];
export type CompactResponseDataMessage<Data = unknown> = [-2, Id, Data];
export type CompactResponseUnsubscribeMessage = [-3, Id];

export type CompactMessage =
  | CompactNotificationMessage
  | CompactRequestDataMessage
  | CompactRequestCompleteMessage
  | CompactRequestErrorMessage
  | CompactRequestUnsubscribeMessage
  | CompactResponseDataMessage
  | CompactResponseCompleteMessage
  | CompactResponseErrorMessage
  | CompactResponseUnsubscribeMessage;

export type CompactMessageBatch = (CompactMessage | CompactMessageBatch)[];
