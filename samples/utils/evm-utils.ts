import { BrowserProvider } from "ethers";

export async function signAndSendEVMTransaction(rawUnsignedTx: string, toAddress: string) {
  await window.ethereum.request({ method: 'eth_requestAccounts' });

  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  // Sign the transaction
  let signedTx = await signer.signTransaction({ data: rawUnsignedTx });

  // Send the signed transaction
  const transaction = await signer.sendTransaction({
    to: toAddress,
    data: signedTx
  });

  const receipt = await transaction.wait();
  console.log('Transaction sent:', receipt);
}
