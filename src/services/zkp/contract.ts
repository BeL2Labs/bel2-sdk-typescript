import { TransactionVerificationStatus } from "./verification-status";

export const convertContractStatus = (contractStatus: bigint | number): TransactionVerificationStatus => {
  /* Contract: enum ProofStatus { toBeVerified, verified, verifyFailed } */
  switch (BigInt(contractStatus)) {
    case BigInt(0): return TransactionVerificationStatus.Pending;
    case BigInt(1): return TransactionVerificationStatus.Verified;
    case BigInt(2): return TransactionVerificationStatus.VerificationFailed;
    default: return TransactionVerificationStatus.Unknown;
  }
}