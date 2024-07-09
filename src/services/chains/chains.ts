import { chainList } from "src/config/chains";
import { EVMChainConfig } from "./evm-chain-config";

export const getChainConfigByChainId = (chainId: bigint | undefined): EVMChainConfig | undefined => {
  if (!chainId)
    return undefined;

  return chainList.find(config => config.chainId === chainId);
}
