import { FC, useCallback, useMemo, useState } from 'react';
import { ethers } from 'ethers';
import { Button, Stack, TextField, Typography } from '@mui/material';
import { TransactionVerificationStatus, EthersV6TransactionVerification } from "@bel2labs/sdk";
import { useBehaviorSubject } from './utils/useBehaviorSubject';

export const Main: FC = () => {
  const [txHash, setTxHash] = useState(null);
  const [error, setError] = useState(null);

  const [verificationBTCTxId, setVerificationBTCTxId] = useState("86ae1606a3ab907a93f5095cc36f2bcde896c3a28f01c455b79d413c4d5667e2");
  const [bitcoinTxVerification, setBitcoinTxVerification] = useState<EthersV6TransactionVerification>(undefined);
  const verificationStatus = useBehaviorSubject(bitcoinTxVerification?.status$);

  const handleVerificationTxIdChanged = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setBitcoinTxVerification(undefined);
    setVerificationBTCTxId(event.target.value);
  }, []);

  const sendTransaction = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const tx = await signer.sendTransaction({
        to: '0xRecipientAddressHere', // Replace with the recipient address
        value: ethers.parseEther('0.01') // Replace with the amount to send
      });

      setTxHash(tx.hash);
    } catch (err) {
      setError(err.message);
    }
  };

  const statusMessage = useMemo(() => {
    switch (verificationStatus) {
      case TransactionVerificationStatus.NotSubmitted:
        return "Transaction verification has not been requested yet. Call prepareVerificationRequest() and publish the EVM transaction";
      case TransactionVerificationStatus.Pending:
        return "Transaction has been submitted to the ZKP service but not handled or not completed yet";
      case TransactionVerificationStatus.VerificationFailed:
        return "ZKP verification is completed but it failed. Check the submitted parameters";
      case TransactionVerificationStatus.Verified:
        return "ZKP verification is completed, the bitcoin transaction is genuine";
    }
  }, [verificationStatus]);

  const handleSetupVerificationInstance = useCallback(async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      if (!verificationBTCTxId)
        return;

      const evmChainId = 20; // Elastos ESC mainnet
      const txVerification = await EthersV6TransactionVerification.create(verificationBTCTxId, evmChainId);
      setBitcoinTxVerification(txVerification);

      if (!txVerification.isSubmitted()) {
        // Prepare/fetch all necessary information related to the bitcoin transaction, and submit the ZKP request
        // to the ZKP evm contract.
        const txResponse = await txVerification.submitVerificationRequest(signer);

        // Wait for EVM transaction to be published
        await txResponse.wait();
      }
    }
    catch (e) {
      console.error(e);
    }
  }, [verificationBTCTxId]);

  return (
    <Stack direction="column" gap={3}>
      <Typography> Paste a bitcoin tx id to check its verification status and to request a verification</Typography>

      <TextField
        label="xxx"
        value={verificationBTCTxId}
        onChange={handleVerificationTxIdChanged}
      />

      {
        !bitcoinTxVerification &&
        <Button variant="contained" onClick={() => handleSetupVerificationInstance()}>Check verification status</Button>
      }

      {
        verificationStatus === TransactionVerificationStatus.NotSubmitted &&
        <Button variant="contained" onClick={() => handleSetupVerificationInstance()}>Verify</Button>
      }

      <Typography>{statusMessage}</Typography>

      {txHash && <p>Transaction Hash: {txHash}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </Stack>
  );
}
