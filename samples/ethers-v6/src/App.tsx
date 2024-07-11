import { useState } from 'react';
import { ethers } from 'ethers';
import { Button, Stack, ThemeProvider } from '@mui/material';
import { theme } from './theme';
import { Main } from './Main';

function App() {
  const [account, setAccount] = useState(null);

  const connectWallet = async () => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Stack direction="column" gap={3} padding={20}>
        <Stack direction="row" sx={{ alignItems: "center", justifyItems: "center" }} gap={2}>
          BeL2 SDK sample for ethers v6
        </Stack>

        <Button onClick={connectWallet} variant="contained" disabled={!!account}>
          {account ? `Connected: ${account}` : 'Connect Wallet'}
        </Button>

        {account && <Main />}
      </Stack>
    </ThemeProvider>
  );
}

export default App;
