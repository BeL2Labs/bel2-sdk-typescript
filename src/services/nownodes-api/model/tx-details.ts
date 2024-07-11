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
    // scriptPubKey { asm, hex, addresses } ?
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
