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