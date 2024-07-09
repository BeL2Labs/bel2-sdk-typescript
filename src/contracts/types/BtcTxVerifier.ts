/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumberish,
  BytesLike,
  FunctionFragment,
  Result,
  Interface,
  EventFragment,
  AddressLike,
  ContractRunner,
  ContractMethod,
  Listener,
} from "ethers";
import type {
  TypedContractEvent,
  TypedDeferredTopicFilter,
  TypedEventLog,
  TypedLogDescription,
  TypedListener,
  TypedContractMethod,
} from "./common";

export type TxVerifyRecordStruct = {
  btcTxZkpAddr: AddressLike;
  zkpID: BytesLike;
};

export type TxVerifyRecordStructOutput = [
  btcTxZkpAddr: string,
  zkpID: string
] & { btcTxZkpAddr: string; zkpID: string };

export type InputStruct = { txid: BytesLike; amount: BigNumberish };

export type InputStructOutput = [txid: string, amount: bigint] & {
  txid: string;
  amount: bigint;
};

export type OutputStruct = {
  txType: BigNumberish;
  addr: string;
  amount: BigNumberish;
};

export type OutputStructOutput = [
  txType: bigint,
  addr: string,
  amount: bigint
] & { txType: bigint; addr: string; amount: bigint };

export interface BtcTxVerifierInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "btcHeaderAddr"
      | "btcTxZkpAddr"
      | "getLastBtcHeight"
      | "getTxVerifyRecord"
      | "getTxZkpStatus"
      | "getVerifiedTxDetails"
      | "initialize"
      | "owner"
      | "renounceOwnership"
      | "setBtcHeaderAddr"
      | "setBtcTxZkpAddr"
      | "transferOwnership"
      | "verifyBtcTx"
  ): FunctionFragment;

  getEvent(
    nameOrSignatureOrTopic:
      | "BtcHeaderAddrChanged"
      | "BtcTxVerified"
      | "BtcTxZkpAddrChanged"
      | "Initialized"
      | "OwnershipTransferred"
  ): EventFragment;

  encodeFunctionData(
    functionFragment: "btcHeaderAddr",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "btcTxZkpAddr",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getLastBtcHeight",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getTxVerifyRecord",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "getTxZkpStatus",
    values: [BytesLike]
  ): string;
  encodeFunctionData(
    functionFragment: "getVerifiedTxDetails",
    values: [BytesLike, string]
  ): string;
  encodeFunctionData(
    functionFragment: "initialize",
    values: [AddressLike, AddressLike]
  ): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "renounceOwnership",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "setBtcHeaderAddr",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "setBtcTxZkpAddr",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "transferOwnership",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "verifyBtcTx",
    values: [
      BytesLike,
      BytesLike[],
      BigNumberish,
      BytesLike[],
      BytesLike,
      BytesLike,
      boolean[],
      BytesLike
    ]
  ): string;

  decodeFunctionResult(
    functionFragment: "btcHeaderAddr",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "btcTxZkpAddr",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getLastBtcHeight",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getTxVerifyRecord",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getTxZkpStatus",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getVerifiedTxDetails",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "initialize", data: BytesLike): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "renounceOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setBtcHeaderAddr",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setBtcTxZkpAddr",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "transferOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "verifyBtcTx",
    data: BytesLike
  ): Result;
}

export namespace BtcHeaderAddrChangedEvent {
  export type InputTuple = [oldAddress: AddressLike, newAddress: AddressLike];
  export type OutputTuple = [oldAddress: string, newAddress: string];
  export interface OutputObject {
    oldAddress: string;
    newAddress: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace BtcTxVerifiedEvent {
  export type InputTuple = [txid: BytesLike];
  export type OutputTuple = [txid: string];
  export interface OutputObject {
    txid: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace BtcTxZkpAddrChangedEvent {
  export type InputTuple = [oldAddress: AddressLike, newAddress: AddressLike];
  export type OutputTuple = [oldAddress: string, newAddress: string];
  export interface OutputObject {
    oldAddress: string;
    newAddress: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace InitializedEvent {
  export type InputTuple = [version: BigNumberish];
  export type OutputTuple = [version: bigint];
  export interface OutputObject {
    version: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace OwnershipTransferredEvent {
  export type InputTuple = [previousOwner: AddressLike, newOwner: AddressLike];
  export type OutputTuple = [previousOwner: string, newOwner: string];
  export interface OutputObject {
    previousOwner: string;
    newOwner: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface BtcTxVerifier extends BaseContract {
  connect(runner?: ContractRunner | null): BtcTxVerifier;
  waitForDeployment(): Promise<this>;

  interface: BtcTxVerifierInterface;

  queryFilter<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;
  queryFilter<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;

  on<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  on<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  once<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  once<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  listeners<TCEvent extends TypedContractEvent>(
    event: TCEvent
  ): Promise<Array<TypedListener<TCEvent>>>;
  listeners(eventName?: string): Promise<Array<Listener>>;
  removeAllListeners<TCEvent extends TypedContractEvent>(
    event?: TCEvent
  ): Promise<this>;

  btcHeaderAddr: TypedContractMethod<[], [string], "view">;

  btcTxZkpAddr: TypedContractMethod<[], [string], "view">;

  getLastBtcHeight: TypedContractMethod<[], [bigint], "view">;

  getTxVerifyRecord: TypedContractMethod<
    [txHash: BytesLike],
    [TxVerifyRecordStructOutput],
    "view"
  >;

  getTxZkpStatus: TypedContractMethod<[txHash: BytesLike], [bigint], "view">;

  getVerifiedTxDetails: TypedContractMethod<
    [txHash: BytesLike, network: string],
    [[string, InputStructOutput[], OutputStructOutput[], string, bigint]],
    "view"
  >;

  initialize: TypedContractMethod<
    [_btcTxZkpAddr: AddressLike, _btcHeaderAddr: AddressLike],
    [void],
    "nonpayable"
  >;

  owner: TypedContractMethod<[], [string], "view">;

  renounceOwnership: TypedContractMethod<[], [void], "nonpayable">;

  setBtcHeaderAddr: TypedContractMethod<
    [newBtcHeaderAddr: AddressLike],
    [void],
    "nonpayable"
  >;

  setBtcTxZkpAddr: TypedContractMethod<
    [newBtcTxZkpAddr: AddressLike],
    [void],
    "nonpayable"
  >;

  transferOwnership: TypedContractMethod<
    [newOwner: AddressLike],
    [void],
    "nonpayable"
  >;

  verifyBtcTx: TypedContractMethod<
    [
      rawTx: BytesLike,
      utxos: BytesLike[],
      blockHeight: BigNumberish,
      merkleProof: BytesLike[],
      blockMerkleRoot: BytesLike,
      txHash: BytesLike,
      proofPositions: boolean[],
      script: BytesLike
    ],
    [void],
    "nonpayable"
  >;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "btcHeaderAddr"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "btcTxZkpAddr"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "getLastBtcHeight"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "getTxVerifyRecord"
  ): TypedContractMethod<
    [txHash: BytesLike],
    [TxVerifyRecordStructOutput],
    "view"
  >;
  getFunction(
    nameOrSignature: "getTxZkpStatus"
  ): TypedContractMethod<[txHash: BytesLike], [bigint], "view">;
  getFunction(
    nameOrSignature: "getVerifiedTxDetails"
  ): TypedContractMethod<
    [txHash: BytesLike, network: string],
    [[string, InputStructOutput[], OutputStructOutput[], string, bigint]],
    "view"
  >;
  getFunction(
    nameOrSignature: "initialize"
  ): TypedContractMethod<
    [_btcTxZkpAddr: AddressLike, _btcHeaderAddr: AddressLike],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "owner"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "renounceOwnership"
  ): TypedContractMethod<[], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "setBtcHeaderAddr"
  ): TypedContractMethod<[newBtcHeaderAddr: AddressLike], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "setBtcTxZkpAddr"
  ): TypedContractMethod<[newBtcTxZkpAddr: AddressLike], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "transferOwnership"
  ): TypedContractMethod<[newOwner: AddressLike], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "verifyBtcTx"
  ): TypedContractMethod<
    [
      rawTx: BytesLike,
      utxos: BytesLike[],
      blockHeight: BigNumberish,
      merkleProof: BytesLike[],
      blockMerkleRoot: BytesLike,
      txHash: BytesLike,
      proofPositions: boolean[],
      script: BytesLike
    ],
    [void],
    "nonpayable"
  >;

  getEvent(
    key: "BtcHeaderAddrChanged"
  ): TypedContractEvent<
    BtcHeaderAddrChangedEvent.InputTuple,
    BtcHeaderAddrChangedEvent.OutputTuple,
    BtcHeaderAddrChangedEvent.OutputObject
  >;
  getEvent(
    key: "BtcTxVerified"
  ): TypedContractEvent<
    BtcTxVerifiedEvent.InputTuple,
    BtcTxVerifiedEvent.OutputTuple,
    BtcTxVerifiedEvent.OutputObject
  >;
  getEvent(
    key: "BtcTxZkpAddrChanged"
  ): TypedContractEvent<
    BtcTxZkpAddrChangedEvent.InputTuple,
    BtcTxZkpAddrChangedEvent.OutputTuple,
    BtcTxZkpAddrChangedEvent.OutputObject
  >;
  getEvent(
    key: "Initialized"
  ): TypedContractEvent<
    InitializedEvent.InputTuple,
    InitializedEvent.OutputTuple,
    InitializedEvent.OutputObject
  >;
  getEvent(
    key: "OwnershipTransferred"
  ): TypedContractEvent<
    OwnershipTransferredEvent.InputTuple,
    OwnershipTransferredEvent.OutputTuple,
    OwnershipTransferredEvent.OutputObject
  >;

  filters: {
    "BtcHeaderAddrChanged(address,address)": TypedContractEvent<
      BtcHeaderAddrChangedEvent.InputTuple,
      BtcHeaderAddrChangedEvent.OutputTuple,
      BtcHeaderAddrChangedEvent.OutputObject
    >;
    BtcHeaderAddrChanged: TypedContractEvent<
      BtcHeaderAddrChangedEvent.InputTuple,
      BtcHeaderAddrChangedEvent.OutputTuple,
      BtcHeaderAddrChangedEvent.OutputObject
    >;

    "BtcTxVerified(bytes32)": TypedContractEvent<
      BtcTxVerifiedEvent.InputTuple,
      BtcTxVerifiedEvent.OutputTuple,
      BtcTxVerifiedEvent.OutputObject
    >;
    BtcTxVerified: TypedContractEvent<
      BtcTxVerifiedEvent.InputTuple,
      BtcTxVerifiedEvent.OutputTuple,
      BtcTxVerifiedEvent.OutputObject
    >;

    "BtcTxZkpAddrChanged(address,address)": TypedContractEvent<
      BtcTxZkpAddrChangedEvent.InputTuple,
      BtcTxZkpAddrChangedEvent.OutputTuple,
      BtcTxZkpAddrChangedEvent.OutputObject
    >;
    BtcTxZkpAddrChanged: TypedContractEvent<
      BtcTxZkpAddrChangedEvent.InputTuple,
      BtcTxZkpAddrChangedEvent.OutputTuple,
      BtcTxZkpAddrChangedEvent.OutputObject
    >;

    "Initialized(uint64)": TypedContractEvent<
      InitializedEvent.InputTuple,
      InitializedEvent.OutputTuple,
      InitializedEvent.OutputObject
    >;
    Initialized: TypedContractEvent<
      InitializedEvent.InputTuple,
      InitializedEvent.OutputTuple,
      InitializedEvent.OutputObject
    >;

    "OwnershipTransferred(address,address)": TypedContractEvent<
      OwnershipTransferredEvent.InputTuple,
      OwnershipTransferredEvent.OutputTuple,
      OwnershipTransferredEvent.OutputObject
    >;
    OwnershipTransferred: TypedContractEvent<
      OwnershipTransferredEvent.InputTuple,
      OwnershipTransferredEvent.OutputTuple,
      OwnershipTransferredEvent.OutputObject
    >;
  };
}