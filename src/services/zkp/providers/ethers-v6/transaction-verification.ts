import { ContractTransactionResponse, JsonRpcProvider, JsonRpcSigner, Wallet } from "ethersv6";
import { getEVMRPCProvider } from "src/services/evm/providers/ethers-v6/read-only-provider";
import { prepareZKPProofParams } from "../../proof-params";
import { TransactionVerification } from "../../transaction-verification";
import { getBitcoinTransactionVerificationStatus, sendBitcoinTransactionVerificationRequest } from "./bitcoin-tx-verifier-contract";

export class EthersV6TransactionVerification extends TransactionVerification {
  private roProvider: JsonRpcProvider;

  protected constructor(btcTxId: string, provider: JsonRpcProvider) {
    super(btcTxId);
    this.roProvider = provider;
  }

  /**
   * Prepares a verification for a given bitcoin transaction id. During this call, the current verification status
   * is first checked so that if a verification has already been requested earlier, the verification state resumes
   * where it was interrupted.
   * 
   * @param chainId EVM chain ID on which the verification result gets linked.
   * @param provider Read-only EVM wallet provider used to fetch the current verification status, if you want to use your own RPC api or provider. Otherwise, a default RPC API is used.
   */
  public static async create(btcTxId: string, chainId: number | bigint, provider?: JsonRpcProvider): Promise<EthersV6TransactionVerification> {
    const tv = new EthersV6TransactionVerification(btcTxId, provider || getEVMRPCProvider(BigInt(chainId)));
    await tv.checkStatus(); // blocking status retrieval, initial value.
    tv.repeatinglyCheckStatus(); // non blocking repeating status retrieval until verified.

    return tv;
  }

  public async checkStatus(): Promise<void> {
    console.log("checking status");
    try {
      const _status = await getBitcoinTransactionVerificationStatus(this.roProvider, this.btcTxId);
      this.status$.next(_status);
    }
    catch (e) {
      console.error("Check status error:", e);
    }
  }

  /**
   * Publishes an EVM transaction that requests generation of a ZKP proof for 
   * this bitcoin transaction.
   * 
   * @param scriptHex If you want ZKP to ensure that a script output matches transaction outputs, pass the script HEX used by the transaction. This is optional.
   */
  public async submitVerificationRequest(signer: JsonRpcSigner|Wallet, scriptHex?: string): Promise<ContractTransactionResponse> {
    // fetch all data required to construct the tx, store in memory
    this.zkpProofParams = await prepareZKPProofParams(this.btcTxId);
    if (!this.zkpProofParams)
      return null;

    return sendBitcoinTransactionVerificationRequest(signer, this.zkpProofParams, scriptHex);
  }
}
