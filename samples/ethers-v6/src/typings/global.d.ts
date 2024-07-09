type SendBitcoinOptions = {
  feeRate: number;
}

type BitcoinPushTx = {
  rawtx: string;
}

// Works for both unisat and OKX
type GenericBitcoinProvider = {
  isEssentials?: boolean;

  on: (event: "accountsChanged", handler: (accounts: string[]) => void) => void;
  removeListener: (event: "accountsChanged", handler: (accounts: string[]) => void) => void;

  requestAccounts: () => Promise<string[]>;
  getAccounts: () => Promise<string[]>;
  sendBitcoin(payAddress: string, satsToPay: number, options: SendBitcoinOptions);
  getPublicKey(): Promise<string>;
  pushTx(rawTx: BitcoinPushTx | string): Promise<string>;
}

/**
 * Special trait for bitcoin providers that support signData()
 */
type SignDataBitcoinProvider = GenericBitcoinProvider & {
  /**
   * Signs any payload, including random data or a real BTC raw transaction (CAUTION).
   * 
   * @param rawData Any HEX payload to sign, a a raw BTC transaction encoded to HEX.
   * 
   * @return Concatenated signature R|S (32 bytes, 32 bytes), HEX.
   */
  signData(rawData: string, type: "ecdsa" | "schnorr"): Promise<string>;
}

interface Window {
  ethereum?: any;
  unisat?: GenericBitcoinProvider | SignDataBitcoinProvider;
  okxwallet?: {
    bitcoin: GenericBitcoinProvider;
    bitcoinTestnet: GenericBitcoinProvider;
  };
}

interface APIResponse<T> {
  code: number;
  message: string;
  data: T;
}
