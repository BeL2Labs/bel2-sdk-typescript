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