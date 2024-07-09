import { providers } from "ethersv5";
import { JsonRpcProvider, Signer } from "ethersv6";

// Ethers v5
export type EthersV5ReadOnlyProvider = providers.JsonRpcProvider;
export type EthersV5ReadWriteProvider = providers.JsonRpcSigner;

// Ethers v6
export type EthersV6ReadOnlyProvider = JsonRpcProvider;
export type EthersV6ReadWriteProvider = Signer;

export type ReadOnlyEVMProvider = EthersV5ReadOnlyProvider | EthersV6ReadOnlyProvider;
export type ReadWriteEVMProvider = EthersV5ReadWriteProvider | EthersV6ReadWriteProvider;