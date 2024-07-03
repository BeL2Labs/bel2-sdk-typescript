# BeL2 SDK

## Installation

`yarn add @bel2/sdk`

## Modules

- zkproofs
-- bitcoin transactions
-- (later) bitcoin blocks
-- (later) runes
-- (later) inscriptions
- (later) other bel2 services than zkp

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
