export type EstimatedFee = {
    feerate: number; // 0.00001 - Estimate fee rate in BTC/kB (only present if no errors were encountered)
    blocks: number; // 888
}
