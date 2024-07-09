import { JsonRpcProvider } from "ethersv6";
import { getChainConfigByChainId } from "src/services/chains/chains";

/**
 * Returns an internal read only RPC providers for the EVM with the given chain ID.
 */
export const getDefaultEVMProvider = (chainId: bigint): JsonRpcProvider => {
  const chainConfig = getChainConfigByChainId(chainId);
  if (!chainConfig)
    throw new Error(`Chain ID ${chainId} is not supported yet`);

  return new JsonRpcProvider(chainConfig.rpcs[0]);
}