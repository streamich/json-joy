import {Observable} from 'rxjs';

export type Method = (payload: unknown) => Observable<unknown>;

/**
 * Types for JSON-Rx messages, see: https://onp4.com/@vadim/p/gv9z33hjuo
 */

/** Must be positive integer. */
export type Id = number;

/** Must be non-empty string, no longer than 128 characters. */
export type Name = string;

export type MessageSubscribe = [Id, Name, unknown] | [Id, Name];

export type MessageComplete = [0, Id, unknown] | [0, Id];

export type MessageError = [-1, Id, unknown];

export type MessageNotification = [Name, unknown] | [Name];

export type MessageData = [-2, Id, unknown];

export type MessageUnsubscribe = [-3, Id];

export type Message =
  | MessageSubscribe
  | MessageUnsubscribe
  | MessageData
  | MessageUnsubscribe
  | MessageError
  | MessageNotification;
