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
