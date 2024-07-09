
export type EVMChainConfig = {
  name: string; // Displayable chain name
  rpcs: string[]; // List of chain RPC endpoints
  explorers: string[]; // List of block explorer API endpoints
  chainId: bigint; // eg: 21 for elastos testnet
  contracts: {
    btcTxVerifier: string; // Address of the bitcoin transaction verifier contract, to submit requests and get status. - https://github.com/BeL2Labs/BtcTxVerifier/blob/main/contracts/BtcTxVerifier.sol
  }
}