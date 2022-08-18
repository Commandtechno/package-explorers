import { USER_FLAGS } from "../constants/USER_FLAGS";

export function hasFlag(flags, FLAG) {
  return (BigInt(flags) & FLAG) === FLAG;
}

export function extractUserFlags(flags) {
  return USER_FLAGS.filter(flag => hasFlag(flags, flag.value));
}