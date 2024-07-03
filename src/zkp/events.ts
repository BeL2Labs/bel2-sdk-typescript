import { TransactionVerificationStatus } from "./transaction-verification";

export class StatusChangedEvent extends Event {
  public status: TransactionVerificationStatus;

  constructor() { super('statusChanged'); }
}

export interface TransactionVerificationEventMap {
  statusChanged: StatusChangedEvent;
}

export type EventType = keyof TransactionVerificationEventMap;