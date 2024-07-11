import { JsonRpcSigner, TransactionRequest } from "@ethersproject/providers";

export const submitTransaction = async (signer: JsonRpcSigner, transaction: TransactionRequest, waitForResult = false) => {
  const gasPrice = await signer.getGasPrice();
  const estimateGas = await signer.estimateGas(transaction);

  const transactionWithGas: TransactionRequest = {
    gasLimit: estimateGas,
    gasPrice,
    ...transaction,
  }

  let hash: string;
  if (waitForResult) {
    // Publish tx then wait until it's processed by the blockchain
    const transactionResponse = await signer?.sendTransaction(transactionWithGas);

    // Wait until the transaction gets mined by one block (or fails)
    await transactionResponse?.wait(1);
    hash = transactionResponse.hash;
  }
  else {
    // Publish tx but immediatelly return without knowing the result
    hash = await signer?.sendUncheckedTransaction(transactionWithGas);
  }

  return hash;
}