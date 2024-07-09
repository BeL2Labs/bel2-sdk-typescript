import { EVMChainConfig } from "@services/chains/evm-chain-config";

/**
 * List of supported EVMs by BeL2.
 */
export const chainList: EVMChainConfig[] = [
  {
    name: "Elastos Smart Chain",
    rpcs: ["https://api2.elastos.net/esc"],
    explorers: ["https://esc.elastos.io"],
    chainId: BigInt(20),
    contracts: {
      btcTxVerifier: "0x5293a9471A4A004874cea7301aC8936F8830BdF2"
    }
  }
];