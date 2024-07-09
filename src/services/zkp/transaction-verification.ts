import { getDefaultEVMProvider } from "@services/evm/evm";
import { ContractRunner, ContractTransactionResponse, Signer } from "ethers";
import { BehaviorSubject } from "rxjs";
import { getBitcoinTransactionVerificationStatus, sendBitcoinTransactionVerificationRequest } from "./btc-tx-verifier-contract";
import { ZKPProofParams, prepareZKPProofParams } from "./proof-params";
import { TransactionVerificationStatus } from "./verification-status";

export class TransactionVerification {
  private zkpProofParams: ZKPProofParams;

  public status$ = new BehaviorSubject<TransactionVerificationStatus>(TransactionVerificationStatus.Unknown);

  private constructor(public btcTxId: string) { }

  /**
   * Prepares a verification for a given bitcoin transaction id. During this call, the current verification status
   * is first checked so that if a verification has already been requested earlier, the verification state resumes
   * where it was interrupted.
   * 
   * @param chainId EVM chain ID on which the verification result gets linked.
   * @param providerOrSigner ethers wallet provider (read-only is enough) used to fetch the current verification status, if you want to use your own RPC api or provider. Otherwise, a default RPC API is used.
   */
  public static async create(btcTxId: string, chainId: number | bigint, providerOrSigner?: ContractRunner): Promise<TransactionVerification> {
    const provider = providerOrSigner || getDefaultEVMProvider(BigInt(chainId));
    const tv = new TransactionVerification(btcTxId);
    await tv.checkStatus(provider);
    return tv;
  }

  private async checkStatus(providerOrSigner: ContractRunner): Promise<void> {
    const _status = await getBitcoinTransactionVerificationStatus(providerOrSigner, this.btcTxId);
    this.status$.next(_status);
  }

  /**
   * Publishes an EVM transaction that requests generation of a ZKP proof for 
   * this bitcoin transaction.
   */
  public async submitVerificationRequest(signer: Signer): Promise<ContractTransactionResponse> {
    // fetch all data required to construct the tx, store in memory
    this.zkpProofParams = await prepareZKPProofParams(this.btcTxId);
    if (!this.zkpProofParams)
      return null;

    return sendBitcoinTransactionVerificationRequest(signer, this.zkpProofParams);
  }

  public getStatus(): TransactionVerificationStatus {
    return this.status$.getValue();
  }

  /**
   * Tells if a ZKP request has been submitted or not for this transaction id.
   */
  public isSubmitted(): boolean {
    return ![
      TransactionVerificationStatus.Unknown,
      TransactionVerificationStatus.NotSubmitted
    ].includes(this.getStatus());
  }

  /** 
   * Tells if the ZKP request has been submitted, processed, then either succeeded or failed.
   */
  public isComplete(): boolean {
    return [
      TransactionVerificationStatus.Verified,
      TransactionVerificationStatus.VerificationFailed
    ].includes(this.getStatus());
  }
}
