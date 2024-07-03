import { TransactionVerification, TransactionVerificationStatus } from "@bel2/sdk";
import { signAndSendEVMTransaction } from "../utils/evm-utils";

async function submitBitcoinTransactionForVerification() {
  const btcTxId = "b5dfa0fa7d1417bd7ab90eb5e62e9ac2e6654b921d0d0bbbc9db0c7c9638f793";

  // Initialize and get the preliminary status, in case this is an existing verification request that we are loading again.
  const testVerification = await TransactionVerification.create(btcTxId);

  if (testVerification.isSubmitted()) {
    // Prepare/fetch all necessary information related to the bitcoin transaction, needed to submit the ZKP request.
    const requestParams = await testVerification.prepareVerificationRequest();

    // Sign and submit the ZKP verification request to the EVM network
    await signAndSendEVMTransaction(requestParams.rawTransaction, requestParams.zkpContractAddress);
  }

  if (!testVerification.isComplete()) {
    testVerification.addEventListener("statusChanged", (e) => {
      switch (e.status) {
        case TransactionVerificationStatus.NotSubmitted:
          console.log("Transaction verification has not been requested yet. Call prepareVerificationRequest() and publish the EVM transaction");
          break;
        case TransactionVerificationStatus.Pending:
          console.log("Transaction has been submitted to the ZKP service but not handled yet");
          break;
        case TransactionVerificationStatus.Verifying:
          console.log("The ZKP service is verifying this transaction");
          break;
        case TransactionVerificationStatus.VerificationFailed:
          console.log("ZKP verification is completed but it failed. Check the submitted parameters");
          break;
        case TransactionVerificationStatus.Verified:
          console.log("ZKP verification is completed, the bitcoin transaction is genuine");
          break;
      }
    });
  }
}

submitBitcoinTransactionForVerification();