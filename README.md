# BeL2 SDK

## Installation

`yarn add @bel2labs/sdk`

## Modules

- ZKP: ZK Proofs for bitcoin transactions

## Supported interfaces

This library abstracts various versions of popular EVM providers for convenience.

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

See `samples` folder for full code.

#### Ethers v6 quickstart

```typescript
import { ZKP } from "@bel2labs/sdk";
import { ethers } from 'ethers';

const verification = await ZKP.EthersV6.TransactionVerification.create(txId, 20);
if (!verification.isSubmitted()) {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  verification.status$.subscribe((status) => {
    console.log("New status:", status);
  });

  const response = await verification.submitVerificationRequest(signer);
}
```

## Contribute / Development

See [Development](docs/development.md)
