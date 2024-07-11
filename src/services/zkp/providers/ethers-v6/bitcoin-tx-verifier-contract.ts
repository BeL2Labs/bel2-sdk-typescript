import { ContractRunner, ContractTransactionResponse, JsonRpcProvider, Signer } from "ethersv6";
import { BtcTxVerifier, BtcTxVerifier__factory } from "src/contracts/types";
import { getChainConfigByChainId } from "src/services/chains/chains";
import { errorToRevertedExecution } from "src/services/evm/providers/ethers-v6/errors";
import { convertContractStatus } from "../../contract";
import { ZKPProofParams } from "../../proof-params";
import { TransactionVerificationStatus } from "../../verification-status";

const connectZkpTxVerifierContract = async (runner: ContractRunner): Promise<BtcTxVerifier> => {
  if (!runner)
    throw new Error("Invalid EVM wallet signer, please connect to a wallet.");

  const network = await runner.provider.getNetwork();
  const activeChain = getChainConfigByChainId(network.chainId);
  if (!activeChain)
    throw new Error("BeL2 ZKP verification is not available on the current EVM network");

  const contractAddress = activeChain.contracts.btcTxVerifier;
  return BtcTxVerifier__factory.connect(contractAddress, runner);
}

export const sendBitcoinTransactionVerificationRequest = async (signer: Signer, verificationParams: ZKPProofParams, script?: string): Promise<ContractTransactionResponse> => {
  const verifierContract = await connectZkpTxVerifierContract(signer);

  const {
    blockHeight,
    txRawData,
    utxos,
    txId,
    txIds,
    merkleRoot,
    leaf,
    proof,
    positions
  } = verificationParams;

  // Generate the verifyBtcTx() transaction and sends it through the given ethers signer
  const txResponse = await verifierContract.verifyBtcTx.send(
    txRawData,
    utxos,
    blockHeight,
    proof,
    merkleRoot,
    `0x${txId}`,
    positions,
    script || "0x" // "If the script is given, it will verify whether the output in this tx has a matching address"
  );

  return txResponse;
}

export const getBitcoinTransactionVerificationStatus = async (providerOrSigner: JsonRpcProvider, txId: string): Promise<TransactionVerificationStatus> => {
  const verifierContract = await connectZkpTxVerifierContract(providerOrSigner);

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