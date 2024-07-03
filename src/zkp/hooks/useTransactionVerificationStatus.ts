import { TransactionVerificationStatus } from "../transaction-verification";

export const useTransactionVerification = (): TransactionVerificationStatus => {
  return TransactionVerificationStatus.NotSubmitted;
}