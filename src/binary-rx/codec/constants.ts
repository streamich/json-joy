export const enum MessageCode {
  Notification = 0b000,
  Subscribe = 0b001,
  Data = 0b010,
  Complete = 0b011,
  Unsubscribe = 0b100,
  Error = 0b101,
}
