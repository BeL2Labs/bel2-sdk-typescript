import { EventType, TransactionVerificationEventMap } from "./events";

export enum TransactionVerificationStatus {
  NotSubmitted,
  Pending, // Awaiting verification
  Verifying,
  Verified, // Success
  VerificationFailed // Transaction could not be proven
}

export class TransactionVerification extends EventTarget {
  private constructor(public btcTxId: string) {
    super();
  }

  public static async create(btcTxId: string): Promise<TransactionVerification> {
    const tv = new TransactionVerification(btcTxId);
    await tv.checkStatus();
    return tv;
  }

  private async checkStatus(): Promise<void> {
    // fetch current zkp verification status
  }

  public async prepareVerificationRequest(): Promise<EVMTransactionRequestParams> {
    // fetch all data required to construct the tx, store in memoty

    // get transaction details from API
    // get block details from tx details
    // get block height and all tx ids of the block
    // use the list of tx ids, and the target tx id, to generate the merkle proof - TBD: only used by loan contract, is this needed for this SDK?
    // fetch tx data for every input utxo
    // provide blockHeight, txRawData, utxos, (proof, merkleRoot, leaf, positions) [merkle proof] to the ZKP contract

    // using the ZKP contract ABI and etherjs, build the EVM transaction that requests ZKP to proof a Bitcoin tx.
    const params = new EVMTransactionRequestParams();
    params.zkpContractAddress = "";
    params.rawTransaction = "";

    return params;
  }

  public isSubmitted(): boolean {
    // whether ZKP request has been submitted or not
    return false;
  }

  public isComplete(): boolean {
    // whether ZKP request has been submitted, processed, then either succeeded or failed.
    return false;
  }

  // TODO: I suggest to replace event listeners with RxJS subjects/behaviour subjects
  public addEventListener<K extends EventType>(type: K, handler: ((event: TransactionVerificationEventMap[K]) => void) | { handleEvent(event: TransactionVerificationEventMap[K]): void } | null, options?: boolean | AddEventListenerOptions): void;
  public addEventListener(type: string, handler: ((event: Event) => void) | { handleEvent(event: Event): void } | null, options?: boolean | AddEventListenerOptions): void {
    super.addEventListener(type, (handler as unknown) as EventListenerOrEventListenerObject, options);

    // TODO: for status changed event, start listening to EVM ZKP events
  }
}

export class EVMTransactionRequestParams {
  // TODO: read only
  public zkpContractAddress: string;
  public rawTransaction: string;
}