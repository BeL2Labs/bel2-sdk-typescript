import { BTCTransaction } from "./tx-details";

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

export type BestBlockHashInfo = {
    backend: {
        bestBlockHash: string; // "00000000000000000001799fe8599393a880675a0a738b5ad9545a877fd70a12"
    }
}