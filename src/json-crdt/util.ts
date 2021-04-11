/**
 * Generate a random 40-bit integer. We use 40-bit integer (5 bytes) for session ID, because
 * the logical clock counter is represented by 24-bit integer, and together they
 * combine into 64-bit integer (8 bytes).
 */
export const random40BitInt = () => Math.floor(0xff_ff_ff_ff_ff * Math.random());
