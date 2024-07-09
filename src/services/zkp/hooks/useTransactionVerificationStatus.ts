import { TransactionVerificationStatus } from "../verification-status";

export const useTransactionVerificationStatus = (btcTxId: string): TransactionVerificationStatus => {
  return TransactionVerificationStatus.NotSubmitted;
}