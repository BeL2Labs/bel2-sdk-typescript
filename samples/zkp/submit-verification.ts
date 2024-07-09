import { TransactionVerification, TransactionVerificationStatus } from "@bel2labs/sdk";
import { Signer } from "ethers";

async function submitBitcoinTransactionForVerification() {
  const signer: Signer = null; // Reaplce with your EVM wallet ethers signer
  const btcTxId = "b5dfa0fa7d1417bd7ab90eb5e62e9ac2e6654b921d0d0bbbc9db0c7c9638f793";

  // Initialize and get the preliminary status, in case this is an existing verification request that we are loading again.
  const bitcoinTxVerification = await TransactionVerification.create(btcTxId, 20);

  bitcoinTxVerification.status$.subscribe((status) => {
    switch (status) {
      case TransactionVerificationStatus.NotSubmitted:
        console.log("Transaction verification has not been requested yet. Call prepareVerificationRequest() and publish the EVM transaction");
        break;
      case TransactionVerificationStatus.Pending:
        console.log("Transaction has been submitted to the ZKP service but not handled or not completed yet");
        break;
      case TransactionVerificationStatus.VerificationFailed:
        console.log("ZKP verification is completed but it failed. Check the submitted parameters");
        break;
      case TransactionVerificationStatus.Verified:
        console.log("ZKP verification is completed, the bitcoin transaction is genuine");
        break;
    }
  });

  if (!bitcoinTxVerification.isSubmitted()) {
    // Prepare/fetch all necessary information related to the bitcoin transaction, and submit the ZKP request
    // to the ZKP evm contract.
    const txResponse = await bitcoinTxVerification.submitVerificationRequest(signer);

    // Wait for EVM transaction to be published
    await txResponse.wait();
  }
}

submitBitcoinTransactionForVerification();