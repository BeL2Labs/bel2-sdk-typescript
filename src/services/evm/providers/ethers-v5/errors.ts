import { errors } from "ethersv5";

/**
 * Tries to understand any kind of contract call error as a potential "revert".
 * If that's a revertion, returns the revert reason.
 */
export const errorToRevertedExecution = (error: any): string => {
  if (error.code !== errors.CALL_EXCEPTION)
    return null;

  const revertReason = error.reason;
  return revertReason;
}