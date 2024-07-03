import { TransactionVerificationStatus } from "../transaction-verification";

export const useTransactionVerificationStatus = (btcTxId: string): TransactionVerificationStatus => {
  return TransactionVerificationStatus.NotSubmitted;
}