import { TransactionVerificationStatus, useTransactionVerificationStatus } from "@sdk/zkp";
import { FC } from "react";

export const MyComp: FC = () => {
  const verificationStatus = useTransactionVerificationStatus("btcTxId");

  return (
    <>
      {
        verificationStatus === TransactionVerificationStatus.Verified &&
        "Transaction verified, you can now run an EVM transaction that deals with the bitcoin transaction output"
      }
    </>
  )
}
