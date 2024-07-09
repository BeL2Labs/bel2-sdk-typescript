import { ContractTransactionResponse } from "ethersv6";
import { EthersV6ReadOnlyProvider, EthersV6ReadWriteProvider } from "src/services/evm/providers";
import { getDefaultEVMProvider } from "src/services/evm/providers/ethers-v6/read-only-provider";
import { prepareZKPProofParams } from "../../proof-params";
import { TransactionVerification } from "../../transaction-verification";
import { getBitcoinTransactionVerificationStatus, sendBitcoinTransactionVerificationRequest } from "./bitcoin-tx-verifier-contract";

export class EthersV6TransactionVerification extends TransactionVerification {
  private roProvider: EthersV6ReadOnlyProvider;

  private constructor(btcTxId: string, providerOrSigner: EthersV6ReadOnlyProvider) {
    super(btcTxId);
    this.roProvider = providerOrSigner;
  }

  /**
   * Prepares a verification for a given bitcoin transaction id. During this call, the current verification status
   * is first checked so that if a verification has already been requested earlier, the verification state resumes
   * where it was interrupted.
   * 
   * @param chainId EVM chain ID on which the verification result gets linked.
   * @param providerOrSigner Read-only EVM wallet provider used to fetch the current verification status, if you want to use your own RPC api or provider. Otherwise, a default RPC API is used.
   */
  public static async create(btcTxId: string, chainId: number | bigint, providerOrSigner?: EthersV6ReadOnlyProvider): Promise<EthersV6TransactionVerification> {
    const provider = providerOrSigner || getDefaultEVMProvider(BigInt(chainId));

    const tv = new EthersV6TransactionVerification(btcTxId, provider);
    await tv.checkStatus();

    return tv;
  }

  public async checkStatus(): Promise<void> {
    const _status = await getBitcoinTransactionVerificationStatus(this.roProvider, this.btcTxId);
    this.status$.next(_status);
  }

  /**
   * Publishes an EVM transaction that requests generation of a ZKP proof for 
   * this bitcoin transaction.
   */
  public async submitVerificationRequest(signer: EthersV6ReadWriteProvider): Promise<ContractTransactionResponse> {
    // fetch all data required to construct the tx, store in memory
    this.zkpProofParams = await prepareZKPProofParams(this.btcTxId);
    if (!this.zkpProofParams)
      return null;

    return sendBitcoinTransactionVerificationRequest(signer, this.zkpProofParams);
  }
}