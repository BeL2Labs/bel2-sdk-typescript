import { CallExceptionError, isCallException } from "ethersv6";

/**
 * Tries to understand any kind of contract call error as a potential "revert".
 * If that's a revertion, returns the revert reason.
 */
export const errorToRevertedExecution = (error: any): string => {
  if (!isCallException(error))
    return null;

  const callException = error as CallExceptionError;
  const revertReason = callException.error?.message;
  return revertReason;
}