import { getChainConfigByChainId } from "@services/chains/chains";
import { JsonRpcApiProvider, JsonRpcProvider } from "ethers";

export const getDefaultEVMProvider = (chainId: bigint): JsonRpcApiProvider => {
  const chainConfig = getChainConfigByChainId(chainId);
  if (!chainConfig)
    throw new Error(`Chain ID ${chainId} is not supported yet`);

  return new JsonRpcProvider(chainConfig.rpcs[0]);
}