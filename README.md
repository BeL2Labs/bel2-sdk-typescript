# BeL2 SDK

## Installation

`yarn add @bel2labs/sdk`

## Modules

- zkproofs
-- bitcoin transactions
-- (later) bitcoin blocks
-- (later) runes
-- (later) inscriptions
- (later) other bel2 services than zkp

## Supported interfaces

This library abstracts different version of popular EVM providers for convenience.

- ethers v6
- ethers v5

## The ZKP module

### Workflow

- A bitcoin transaction is published. Either a regular transfer, or a more complex script.
- An EVM contract, or directly a dApp, requests the ZKP contract to generate the proof for the transaction. For this, it submits a set of mandatory values about the bitcoin transaction, so that BeL2 can verify it.
- The BeL2 ZKP service produces the cairo proof and makes it availabiel from EVM smart contracts to verify.

### Submitting a proof from a contract

This topic is not covered by this SDK. Please refer to [doc of zkp contract].

### Submitting a proof from a client app or web service

See `samples/zkp/submit-verification.ts`

### React hooks

See `samples/zkp-react/react-sample.tsx`

## Development notes

- Do NOT use custom tsconfig paths, they rollup/typescript cannot easily produce declaration files.
- After running `yarn typechain`, edit 3 source files in src/contracts/ ethersv5/ethersv6 to replace the "ethers" imports with "ethersv5" or "ethersv6".