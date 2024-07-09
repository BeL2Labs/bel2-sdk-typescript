type VIn = {
    txid: string;
    sequence: number;
    n: number;
    addresses: string[];
    value: string; // satoshi
    isAddress: boolean;
    hex: string;
}

type VOut = {
    value: string;
    n: number;
    hex: string;
    addresses: string[];
    isAddress: boolean;
}

export type BTCTransaction = {
    blockHash: string; // The block hash containing the transaction.
    blockHeight: number; // The block height containing the transaction.
    blockTime: number; // The block time expressed in UNIX epoch time (seconds).
    confirmations: number; // The number of confirmations for the transaction. Negative confirmations means the transaction conflicted that many blocks ago.
    value: string; // Amount in sats
    valueIn: string; // eg: "400000"
    fees: string; // sats "2464"
    size: number; // eg: 205 vsats
    txid: string; // The transaction id.
    vin: VIn[];
    vout: VOut[];
    vsize: number;
    hex: string; // Transaction data
};

export type BTCBlock = {
    page: number; // 1,
    totalPages: number; // 3,
    itemsOnPage: number; // 1000,
    hash: number; // "0000000000000000000ccb9329b01b002c8be6ebf430725704d3c567e977e306",
    previousBlockHash: string; // "00000000000000000003639292daa023e941d4365ceb6d5e9dc77b170a690fc1",
    nextBlockHash: string; // "00000000000000000005c0765f9b7b854883c0c8bd4baed3b1e2003cee393d06",
    height: number; // 703052,
    confirmations: number; // 60107,
    size: number; // 1416455,
    time: number; // 1633108318,
    version: number; // 536870916,
    merkleRoot: string; // "db14ba2713309e5e960f57af6f570d6f68a27b0b2303af93c36e524a75dbdaf3",
    nonce: string; // "1448275021",
    bits: string; // "170ed0eb",
    difficulty: string; // "18997641161758.95",
    txCount: number; // 2772,
    txs: BTCTransaction[]; // Long list, usually up to 1000 per query
}

export type UTXO = {
    txid: string;
    hash: string;
    value: string; //satoshi
    height: number;
    vout: number;
    confirmations: number;
    scriptPubKey?: string;
    utxoHex?: string
}

export type AddressInfo = {
    page: number;
    totalPages: number;
    itemsOnPage: number;

    address: string;
    balance: string; // sats
    totalReceived: string;
    totalSent: string;
    unconfirmedBalance: string;
    unconfirmedTxs: number;
    txs: number;
    txids: string[];
};

export type RPCNodeRequest = {
    jsonrpc: "2.0",
    id: string; // "nownodes",
    method: string; // "estimatesmartfee",
    params: any;
}

export type RPCNodeResult<T> = {
    result: T;
    error?: any;
    id: string;
}

export type EstimatedFee = {
    feerate: number; // 0.00001 - Estimate fee rate in BTC/kB (only present if no errors were encountered)
    blocks: number; // 888
}

export type BestBlockHashInfo = {
    backend: {
        bestBlockHash: string; // "00000000000000000001799fe8599393a880675a0a738b5ad9545a877fd70a12"
    }
}