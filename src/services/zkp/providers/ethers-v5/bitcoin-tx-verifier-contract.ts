import { JsonRpcProvider, JsonRpcSigner } from "@ethersproject/providers";
import { BtcTxVerifier, BtcTxVerifier__factory } from "src/contracts/ethersv5/types";
import { getChainConfigByChainId } from "src/services/chains/chains";
import { errorToRevertedExecution } from "src/services/evm/providers/ethers-v5/errors";
import { submitTransaction } from "src/services/evm/providers/ethers-v5/submit";
import { convertContractStatus } from "../../contract";
import { ZKPProofParams } from "../../proof-params";
import { TransactionVerificationStatus } from "../../verification-status";

const connectZkpTxVerifierContract = async (provider: JsonRpcProvider | JsonRpcSigner): Promise<BtcTxVerifier> => {
  if (!provider)
    throw new Error("Invalid EVM wallet signer, please connect to a wallet.");

  var chainId: number;
  if (provider instanceof JsonRpcProvider)
    chainId = (await (provider as JsonRpcProvider).getNetwork()).chainId;
  else
    chainId = await (provider as JsonRpcSigner).getChainId();

  const activeChain = getChainConfigByChainId(chainId);
  if (!activeChain)
    throw new Error("BeL2 ZKP verification is not available on the current EVM network");

  const contractAddress = activeChain.contracts.btcTxVerifier;
  return BtcTxVerifier__factory.connect(contractAddress, provider);
}

export const sendBitcoinTransactionVerificationRequest = async (provider: JsonRpcSigner, verificationParams: ZKPProofParams, script?: string, waitForResult = false): Promise<string> => {
  const verifierContract = await connectZkpTxVerifierContract(provider);

  const {
    blockHeight,
    txRawData,
    utxos,
    txId,
    merkleRoot,
    proof,
    positions
  } = verificationParams;

  console.log("verificationParams", verificationParams)

  // Generate the verifyBtcTx() transaction and sends it through the given ethers signer
  const unsignedTx = await verifierContract.populateTransaction.verifyBtcTx(
    txRawData,
    utxos,
    blockHeight,
    proof,
    merkleRoot,
    `0x${txId}`,
    positions,
    script || "0x" // "If the script is given, it will verify whether the output in this tx has a matching address"
  );

  return submitTransaction(provider, unsignedTx, waitForResult);
}

export const getBitcoinTransactionVerificationStatus = async (provider: JsonRpcProvider, txId: string): Promise<TransactionVerificationStatus> => {
  const verifierContract = await connectZkpTxVerifierContract(provider);

  try {
    const rawStatus = await verifierContract.getTxZkpStatus(`0x${txId}`);
    return convertContractStatus(rawStatus);
  }
  catch (e) {
    const revertedReason = errorToRevertedExecution(e);
    if (revertedReason === "RecordNotFound")
      return TransactionVerificationStatus.NotSubmitted;
    else
      return TransactionVerificationStatus.Unknown;
  }
}