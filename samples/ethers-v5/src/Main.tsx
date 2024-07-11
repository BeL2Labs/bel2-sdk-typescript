import { FC, useCallback, useMemo, useState } from 'react';
import { Button, Stack, TextField, Typography } from '@mui/material';
import { useBehaviorSubject } from './utils/useBehaviorSubject';
import { ZKP } from "@bel2labs/sdk";
import { Web3Provider } from '@ethersproject/providers';

export const Main: FC = () => {
  const [error, setError] = useState<string>(null);
  const [checkingStatus, setCheckingStatus] = useState<boolean>(false);
  const [requestingVerification, setRequestingVerification] = useState<boolean>(false);

  const [verificationBTCTxId, setVerificationBTCTxId] = useState("a8d831436fc9aedeb1d45249531aa7020d0d74865483ed16a1bbb324e5d48e5f");
  const [bitcoinTxVerification, setBitcoinTxVerification] = useState<ZKP.EthersV5.TransactionVerification>(undefined);
  const verificationStatus = useBehaviorSubject(bitcoinTxVerification?.status$);

  const handleVerificationTxIdChanged = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setBitcoinTxVerification(undefined);
    setVerificationBTCTxId(event.target.value);
  }, []);

  const verificationStatusMessage = useMemo(() => {
    switch (verificationStatus) {
      case ZKP.TransactionVerificationStatus.NotSubmitted:
        return "Transaction verification has not been requested yet. Call prepareVerificationRequest() and publish the EVM transaction";
      case ZKP.TransactionVerificationStatus.Pending:
        return "Transaction has been submitted to the ZKP service but not handled or not completed yet";
      case ZKP.TransactionVerificationStatus.VerificationFailed:
        return "ZKP verification is completed but it failed. Check the submitted parameters";
      case ZKP.TransactionVerificationStatus.Verified:
        return "ZKP verification is completed, the bitcoin transaction is genuine";
      default:
        return "Unknown ZKP verification status";
    }
  }, [verificationStatus]);

  const handleSetupVerificationInstance = useCallback(async () => {
    try {
      setError(null);
      setCheckingStatus(true);

      if (!verificationBTCTxId)
        return;

      const evmChainId = 20; // Elastos ESC mainnet
      const txVerification = await ZKP.EthersV5.TransactionVerification.create(verificationBTCTxId, evmChainId);
      setBitcoinTxVerification(txVerification);
    }
    catch (e) {
      console.error(e);
      setError(`${e}`);
    }

    setCheckingStatus(false);
  }, [verificationBTCTxId]);

  const handleRequestVerification = useCallback(async () => {
    if (!bitcoinTxVerification.isSubmitted()) {
      setError(null);
      setRequestingVerification(true);

      try {
        const provider = new Web3Provider(window.ethereum);
        const signer = await provider.getSigner();

        // Prepare/fetch all necessary information related to the bitcoin transaction, and submit the ZKP request
        // to the ZKP evm contract.
        const txHash = await bitcoinTxVerification.submitVerificationRequest(signer, null, true);
        console.log("Published transaction response:", txHash);

        if (!txHash) {
          setError("Empty transaction response, try again.");
        }
      }
      catch (e) {
        console.error(e);
        setError(`${e}`);
      }

      setRequestingVerification(false);
    }
  }, [bitcoinTxVerification]);

  return (
    <Stack direction="column" gap={2}>
      <Typography> Paste a bitcoin tx id to check its verification status and to request a verification</Typography>

      <TextField
        label="Bitcoin transaction ID to ZKP verify"
        value={verificationBTCTxId}
        onChange={handleVerificationTxIdChanged}
      />

      {
        !bitcoinTxVerification &&
        <Button
          variant="contained"
          disabled={checkingStatus}
          onClick={() => handleSetupVerificationInstance()}>Check verification status</Button>
      }

      {
        verificationStatus === ZKP.TransactionVerificationStatus.NotSubmitted &&
        <Button
          variant="contained"
          disabled={requestingVerification}
          onClick={() => handleRequestVerification()}>Request verification</Button>
      }

      <Typography>{verificationStatusMessage}</Typography>

      {checkingStatus && <p>Checking verification status, please hold on...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </Stack>
  );
}
