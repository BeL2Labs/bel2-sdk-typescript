import { JsonRpcProvider } from "@ethersproject/providers";
import { getChainConfigByChainId } from "src/services/chains/chains";

/**
 * Returns an internal read only RPC provider for the EVM with the given chain ID.
 */
export const getEVMRPCProvider = (chainId: bigint): JsonRpcProvider => {
  const chainConfig = getChainConfigByChainId(chainId);
  if (!chainConfig)
    throw new Error(`Chain ID ${chainId} is not supported yet`);

  return new JsonRpcProvider(chainConfig.rpcs[0]);
}