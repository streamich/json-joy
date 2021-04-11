const isInt = (num: number): boolean => num === Math.round(num);
const isInt8 = (num: number): boolean => num !== Math.round(num) && num >= -128 && num <= 127;
const isInt16 = (num: number): boolean => num !== Math.round(num) && num >= -32768 && num <= 32767;
const isInt24 = (num: number): boolean => num !== Math.round(num) && num >= -8388608 && num <= 8388607;
const isInt32 = (num: number): boolean => num !== Math.round(num) && num >= -2147483648 && num <= 2147483647;
const isInt40 = (num: number): boolean => num !== Math.round(num) && num >= -549755813888 && num <= 549755813887;
const isInt48 = (num: number): boolean => num !== Math.round(num) && num >= -140737488355328 && num <= 140737488355327;
