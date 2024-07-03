import { sha256 } from "@utils/crypto/sha256";
import { MerkleTree } from "merkletreejs";
import { getBlock, getTransactionDetails } from "src/nownodes-api/nownodes-api";

export type ProofParams = {
  blockHeight: number;
  txRawData: string;
  utxos: string[];
  proof: string[];
  merkleRoot: string;
  leaf: string;
  positions: boolean[];
}

/**
 * Retrieves and returns all info needed to be able to submit a proof of BTC payment
 * to the asset exchange contract, in order to proove that the payment has been done.
 * The required information is most found on bitcoin chain block/transaction/utxos.
 *
 * NOTE: BTC to ETH requires reversing most tx/block hashes because of the different byte endianess they use - btcToEVMHexBytes().
 * NOTE: the merkle proof is an array, one entry for each node of the tree that must be traversed between a leaf and the root (the path).
 *
 * https://github.com/BeLayer2/AssetExchange/blob/main/test/exchange.test.js
 */
export const getFillOrderProofParams = async (txId: string): Promise<ProofParams> => {
  console.log("Building fill order proof parameters for order ID:", txId);

  const txDetails = await getTransactionDetails(txId);
  console.log("Got transaction details:", txDetails);
  if (!txDetails)
    return null;

  const { blockInfo, txIds } = (await getBlock(txDetails.blockHash, true)) || {};
  console.log("Got block info:", blockInfo);
  if (!blockInfo)
    return null;

  const blockHeight = blockInfo.height;
  const txRawData = "0x" + txDetails.hex;
  const { merkleRoot, proof, leaf, positions } = generateMerkleProof(txIds, txId);

  // TBD: Apparently, the utxos array is composed of the raw transaction data (not byte reversed) of every parent transaction in "vin"
  const utxos: string[] = [];
  for (const vin of txDetails.vin) {
    const txData = await getTransactionDetails(vin.txid);
    if (!txData)
      return null;

    utxos.push("0x" + txData.hex);
  }

  return {
    blockHeight,
    txRawData,
    utxos,
    proof,
    merkleRoot,
    leaf,
    positions
  };
}

const generateMerkleProof = (btcTxIds: string[], paymentBtcTxId: string) => {
  const leaf = "0x" + paymentBtcTxId;
  const leaves = btcTxIds.map(tx => "0x" + tx);
  const tree = new MerkleTree(leaves, sha256, { isBitcoinTree: true, duplicateOdd: false, sort: false });
  const merkleRoot = tree.getHexRoot();

  const proof = tree.getHexProof(leaf);
  const positions = tree.getProof(leaf).map(p => p.position === "right");

  console.log("Computed tree root:", tree.getHexRoot())
  console.log("Verified?:", tree.verify(tree.getProof(leaf), leaf, tree.getRoot()));
  // console.log(tree.toString())

  return {
    merkleRoot,
    leaf,
    proof,
    positions
  };
}