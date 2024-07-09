export enum TransactionVerificationStatus {
  Unknown, // Status hasn't been retrieved yet
  NotSubmitted, // Transaction has never been submitted for ZKP verification
  Pending, // Transaction has been submitted for ZKP verification to the ZKP contract, but proof generation has not been handled or completed yet
  Verified, // Transaction proof has been successfully created and is ready to be checked from EVM smart contracts
  VerificationFailed // Transaction could not be proven
}