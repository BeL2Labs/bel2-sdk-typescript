import { BehaviorSubject } from "rxjs";
import { ZKPProofParams } from "./proof-params";
import { TransactionVerificationStatus } from "./verification-status";

export class TransactionVerification {
  protected zkpProofParams: ZKPProofParams;

  public status$ = new BehaviorSubject<TransactionVerificationStatus>(TransactionVerificationStatus.Unknown);

  public constructor(public btcTxId: string) { }

  public checkStatus(): Promise<void> {
    return;
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
