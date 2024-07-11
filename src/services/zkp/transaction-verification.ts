import { BehaviorSubject } from "rxjs";
import { ZKPProofParams } from "./proof-params";
import { TransactionVerificationStatus } from "./verification-status";

const CheckStatusIntervalMs = 3000; // Time in milliseconds between 2 ZKP status checks

export abstract class TransactionVerification {
  protected zkpProofParams: ZKPProofParams;

  public status$ = new BehaviorSubject<TransactionVerificationStatus>(TransactionVerificationStatus.Unknown);

  public constructor(public btcTxId: string) { }

  protected abstract checkStatus(): Promise<void>;

  protected repeatinglyCheckStatus() {
    setTimeout(() => {
      this.checkStatus().then(() => {
        this.repeatinglyCheckStatus();
      });
    }, CheckStatusIntervalMs);
  }

  public getStatus(): TransactionVerificationStatus {
    return this.status$.getValue();
  }

  /**
   * Tells if a ZKP verification request has been submitted or not for this transaction id.
   */
  public isSubmitted(): boolean {
    return ![
      TransactionVerificationStatus.Unknown,
      TransactionVerificationStatus.NotSubmitted
    ].includes(this.getStatus());
  }

  /** 
   * Tells if the ZKP verification request has been submitted, processed, then either succeeded or failed.
   */
  public isComplete(): boolean {
    return [
      TransactionVerificationStatus.Verified,
      TransactionVerificationStatus.VerificationFailed
    ].includes(this.getStatus());
  }
}