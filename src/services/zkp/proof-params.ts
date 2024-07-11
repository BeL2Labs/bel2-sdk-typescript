import { MerkleTree } from "merkletreejs";
import { sha256 } from "../../utils/crypto/sha256";
import { getBlock, getTransactionDetails, getTransactionSpecific } from "../nownodes-api/nownodes-api";

/**
 * Input parameters needed by the ZKP contract to submit a bitcoin transaction proof
 * request. With those params, the BeL2 ZKP service is able to generate a cairo circuit to prove
 * a bitcoin transaction.
 */
export type ZKPProofParams = {
  blockHeight: number;
  txRawData: string;
  txId: string; // The transaction being verified
  txIds: string[]; // Transaction IDs of all transaction in the same block as the target txId
  utxos: string[];
  proof: string[];
  merkleRoot: string;
  leaf: string;
  positions: boolean[];
  script: string; // Bitcoin transaction script HEX
}

/**
 * Retrieves and returns all info needed to be able to submit a ZKP proof contract, in order to 
 * proove that a payment has been done.
 * The required information is mostly found on bitcoin chain block/transaction/utxos.
 *
 * NOTE: the merkle proof is an array, one entry for each node of the tree that must be traversed between a leaf and the root (the path).
 * 
 * @returns blockHeight bitcoin block height at which the transaction was mined.
 * @returns utxos the list of all transaction raw data of utxos that are spent by the transaction.
 */
export const prepareZKPProofParams = async (txId: string): Promise<ZKPProofParams> => {
  console.log("Building fill order proof parameters for bitcoin transaction ID:", txId);

  const txSpecifics = await getTransactionSpecific(txId);
  console.log("Got transaction specifics:", txSpecifics);
  if (!txSpecifics)
    return null;

  const { blockInfo, txIds } = (await getBlock(txSpecifics.blockhash, true)) || {};
  console.log("Got block info:", blockInfo);
  if (!blockInfo)
    return null;

  const blockHeight = blockInfo.height;
  const txRawData = "0x" + txSpecifics.hex;
  const script = "TODO";

  const utxos: string[] = [];
  for (const vin of txSpecifics.vin) {
    const txData = await getTransactionDetails(vin.txid);
    if (!txData)
      return null;

    utxos.push("0x" + txData.hex);
  }

  const merkleParams = await prepareMerkleProofParams(txIds, txId);
  if (!merkleParams)
    return null;

  const { merkleRoot, leaf, proof, positions } = merkleParams;

  return {
    blockHeight,
    txRawData,
    script,
    utxos,
    txId,
    txIds,
    merkleRoot,
    leaf,
    proof,
    positions
  };
}

/**
 * Generates the merkle proof that proves that a transaction id is really part of a bitcoin block.
 * Call prepareZKPProofParams() first to get the list of all transaction ids in the block.
 * The merkle proof can then be verified on chain from EVM contracts.
 */
const prepareMerkleProofParams = (btcTxIds: string[], paymentBtcTxId: string) => {
  const leaf = "0x" + paymentBtcTxId;
  const leaves = btcTxIds.map(tx => "0x" + tx);
  const tree = new MerkleTree(leaves, sha256, { isBitcoinTree: true, duplicateOdd: false, sort: false });
  const merkleRoot = tree.getHexRoot();

  const proof = tree.getHexProof(leaf);
  const positions = tree.getProof(leaf).map(p => p.position === "right");

  //console.log("Computed tree root:", tree.getHexRoot())
  //console.log("Verified?:", tree.verify(tree.getProof(leaf), leaf, tree.getRoot()));
  //console.log(tree.toString())

  return {
    merkleRoot,
    leaf,
    proof,
    positions
  };
}