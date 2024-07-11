type ScriptSig = {
    asm: string;
    hex: string;
}

type ScriptPubKey = {
    asm: string;
    desc: string;
    hex: string;
    address: string;
    type: string;
}

type VIn = {
    txid: string;
    vout: number;
    sequence: number;
    scriptSig: ScriptSig;
}

type VOut = {
    value: string;
    n: number;
    scriptPubKey: ScriptPubKey;
}

/**
 * Model returned by calls to /tx-specific, is slightly different from the /tx/
 * version.
 */
export type BTCTransactionSpecific = {
    txid: string; // The transaction id.
    hash: string;
    size: number; // eg: 205 vsats
    vsize: number;
    weight: number;
    locktime: number;
    vin: VIn[];
    vout: VOut[];
    hex: string; // Transaction data
    blockhash: string; // The block hash containing the transaction.
    confirmations: number; // The number of confirmations for the transaction. Negative confirmations means the transaction conflicted that many blocks ago.
    time: number;
    blocktime: number; // The block time expressed in UNIX epoch time (seconds).
};
