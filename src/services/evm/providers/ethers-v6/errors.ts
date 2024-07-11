import { CallExceptionError, isCallException } from "ethersv6";

/**
 * Tries to understand any kind of contract call error as a potential "revert".
 * If that's a revertion, returns the revert reason.
 * 
 * Error structure example:
  {
    "code": "CALL_EXCEPTION",
    "action": "call",
    "data": "0x08c379a00000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000e5265636f72644e6f74466f756e64000000000000000000000000000000000000",
    "reason": "RecordNotFound",
    "transaction": {
        "to": "0x5293a9471A4A004874cea7301aC8936F8830BdF2",
        "data": "0x7805ae1386ae1606a3ab907a93f5095cc36f2bcde896c3a28f01c455b79d413c4d5667e2"
    },
    "invocation": {
        "method": "getTxZkpStatus",
        "signature": "getTxZkpStatus(bytes32)",
        "args": [
            "0x86ae1606a3ab907a93f5095cc36f2bcde896c3a28f01c455b79d413c4d5667e2"
        ]
    },
    "revert": {
        "signature": "Error(string)",
        "name": "Error",
        "args": [
            "RecordNotFound"
        ]
    },
    "shortMessage": "execution reverted: \"RecordNotFound\""
  }
 */
export const errorToRevertedExecution = (error: any): string => {
  if (!isCallException(error))
    return null;

  const callException = error as CallExceptionError;
  const revertReason = callException.reason;
  return revertReason;
}