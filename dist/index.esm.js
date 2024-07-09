import { JsonRpcProvider, ContractFactory, Interface, Contract, isCallException } from 'ethersv6';
import { MerkleTree } from 'merkletreejs';
import axios from 'axios';
import { BehaviorSubject } from 'rxjs';

var EVMProviderType;
(function (EVMProviderType) {
    EVMProviderType[EVMProviderType["EthersV5"] = 0] = "EthersV5";
    EVMProviderType[EVMProviderType["EthersV6"] = 1] = "EthersV6";
})(EVMProviderType || (EVMProviderType = {}));

/**
 * List of supported EVMs by BeL2.
 */
const chainList = [
    {
        name: "Elastos Smart Chain",
        rpcs: ["https://api2.elastos.net/esc"],
        explorers: ["https://esc.elastos.io"],
        chainId: BigInt(20),
        contracts: {
            btcTxVerifier: "0x5293a9471A4A004874cea7301aC8936F8830BdF2"
        }
    }
];

const getChainConfigByChainId = (chainId) => {
    if (!chainId)
        return undefined;
    return chainList.find(config => config.chainId === chainId);
};

/**
 * Returns an internal read only RPC providers for the EVM with the given chain ID.
 */
const getDefaultEVMProvider = (chainId) => {
    const chainConfig = getChainConfigByChainId(chainId);
    if (!chainConfig)
        throw new Error(`Chain ID ${chainId} is not supported yet`);
    return new JsonRpcProvider(chainConfig.rpcs[0]);
};

const { createHash } = require("crypto-browserify"); // TODO: browser vs nodejs
function sha256(data) {
    const hash = createHash('sha256');
    hash.update(data);
    const hashValue = hash.digest();
    return hashValue;
}

/**
 * Nownodes BTC Services
 * https://documenter.getpostman.com/view/13630829/TVmFkLwy#53f3a035-507d-47c1-81c2-f0dea88dacb9
 *
 * Nownodes API is proxied behind a bel2 endpoint in order to hide the API key while providing a convenient API
 * for this SDK to use. Later on, a bel2 api key generation might be needed to monitor traffic usage and prevent
 * abuses.
 */
// const mainnetNodeApi = 'https://nownodes-btc.bel2.org'; // Maps to 'https://btc.nownodes.io';
const mainnetExplorerApi = 'https://nownodes-btcbook.bel2.org'; // Maps to 'https://btcbook.nownodes.io';
const apiGet = async (url) => {
    const response = await axios({ method: "GET", url });
    return response?.data;
};
const rootExplorerApi = () => {
    return mainnetExplorerApi;
};
/**
 * Returns information about a block, from its height or hash.
 *
 * @param withTxIds if true, API is called in a loop until all transactions of the block are retrieved. Transaction IDs are returned in a separate object
 */
const getBlock = async (heightOrHash, withTxIds = false) => {
    try {
        let requestUrl = `${rootExplorerApi()}/api/v2/block/${heightOrHash}`;
        let blockInfo = await apiGet(requestUrl);
        if (!blockInfo || "error" in blockInfo)
            return { blockInfo: undefined, txIds: undefined };
        // Caller wants all transactions. So we continue to iterate all pages and build the txIds list.
        let txIds = undefined;
        if (withTxIds) {
            // Append transactions of the already fetched first page
            txIds = blockInfo?.txs.map(t => t.txid);
            for (let i = 2; i <= blockInfo?.totalPages || 0; i++) {
                // console.log(`Fetching block's transaction page ${i}`);
                let nextPageInfo = await apiGet(`${requestUrl}?page=${i}`);
                txIds.push(...nextPageInfo.txs.map(t => t.txid));
            }
        }
        return { blockInfo, txIds };
    }
    catch (err) {
        console.error('NowNodes: failed to get address info:', err);
        return null;
    }
};
/**
 * Gets all transaction details for a given transaction ID.
 * EXPLORER api
 */
const getTransactionDetails = async (txId) => {
    try {
        let requestUrl = `${rootExplorerApi()}/api/v2/tx/${txId}`;
        return await apiGet(requestUrl);
    }
    catch (err) {
        console.error('NowNodes: failed to get transaction details:', err);
        return null;
    }
};

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
const prepareZKPProofParams = async (txId) => {
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
    const utxos = [];
    for (const vin of txDetails.vin) {
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
        utxos,
        txId,
        txIds,
        merkleRoot,
        leaf,
        proof,
        positions
    };
};
/**
 * Generates the merkle proof that proves that a transaction id is really part of a bitcoin block.
 * Call prepareZKPProofParams() first to get the list of all transaction ids in the block.
 * The merkle proof can then be verified on chain from EVM contracts.
 */
const prepareMerkleProofParams = (btcTxIds, paymentBtcTxId) => {
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
};

var TransactionVerificationStatus;
(function (TransactionVerificationStatus) {
    TransactionVerificationStatus[TransactionVerificationStatus["Unknown"] = 0] = "Unknown";
    TransactionVerificationStatus[TransactionVerificationStatus["NotSubmitted"] = 1] = "NotSubmitted";
    TransactionVerificationStatus[TransactionVerificationStatus["Pending"] = 2] = "Pending";
    TransactionVerificationStatus[TransactionVerificationStatus["Verified"] = 3] = "Verified";
    TransactionVerificationStatus[TransactionVerificationStatus["VerificationFailed"] = 4] = "VerificationFailed"; // Transaction could not be proven
})(TransactionVerificationStatus || (TransactionVerificationStatus = {}));

class TransactionVerification {
    constructor(btcTxId) {
        this.btcTxId = btcTxId;
        this.status$ = new BehaviorSubject(TransactionVerificationStatus.Unknown);
    }
    checkStatus() {
        return;
    }
    getStatus() {
        return this.status$.getValue();
    }
    /**
     * Tells if a ZKP request has been submitted or not for this transaction id.
     */
    isSubmitted() {
        return ![
            TransactionVerificationStatus.Unknown,
            TransactionVerificationStatus.NotSubmitted
        ].includes(this.getStatus());
    }
    /**
     * Tells if the ZKP request has been submitted, processed, then either succeeded or failed.
     */
    isComplete() {
        return [
            TransactionVerificationStatus.Verified,
            TransactionVerificationStatus.VerificationFailed
        ].includes(this.getStatus());
    }
}

const convertContractStatus = (contractStatus) => {
    /* Contract: enum ProofStatus { toBeVerified, verified, verifyFailed } */
    switch (contractStatus) {
        case BigInt(0): return TransactionVerificationStatus.Pending;
        case BigInt(1): return TransactionVerificationStatus.Verified;
        case BigInt(2): return TransactionVerificationStatus.VerificationFailed;
        default: return TransactionVerificationStatus.Unknown;
    }
};

const _abi = [
    {
        inputs: [],
        stateMutability: "nonpayable",
        type: "constructor",
    },
    {
        inputs: [],
        name: "InvalidInitialization",
        type: "error",
    },
    {
        inputs: [],
        name: "NotInitializing",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "owner",
                type: "address",
            },
        ],
        name: "OwnableInvalidOwner",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "account",
                type: "address",
            },
        ],
        name: "OwnableUnauthorizedAccount",
        type: "error",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "oldAddress",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "newAddress",
                type: "address",
            },
        ],
        name: "BtcHeaderAddrChanged",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "bytes32",
                name: "txid",
                type: "bytes32",
            },
        ],
        name: "BtcTxVerified",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "oldAddress",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "newAddress",
                type: "address",
            },
        ],
        name: "BtcTxZkpAddrChanged",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint64",
                name: "version",
                type: "uint64",
            },
        ],
        name: "Initialized",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "previousOwner",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "newOwner",
                type: "address",
            },
        ],
        name: "OwnershipTransferred",
        type: "event",
    },
    {
        inputs: [],
        name: "btcHeaderAddr",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "btcTxZkpAddr",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "getLastBtcHeight",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "bytes32",
                name: "txHash",
                type: "bytes32",
            },
        ],
        name: "getTxVerifyRecord",
        outputs: [
            {
                components: [
                    {
                        internalType: "address",
                        name: "btcTxZkpAddr",
                        type: "address",
                    },
                    {
                        internalType: "bytes32",
                        name: "zkpID",
                        type: "bytes32",
                    },
                ],
                internalType: "struct TxVerifyRecord",
                name: "",
                type: "tuple",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "bytes32",
                name: "txHash",
                type: "bytes32",
            },
        ],
        name: "getTxZkpStatus",
        outputs: [
            {
                internalType: "enum ProofStatus",
                name: "",
                type: "uint8",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "bytes32",
                name: "txHash",
                type: "bytes32",
            },
            {
                internalType: "string",
                name: "network",
                type: "string",
            },
        ],
        name: "getVerifiedTxDetails",
        outputs: [
            {
                internalType: "bytes32",
                name: "",
                type: "bytes32",
            },
            {
                components: [
                    {
                        internalType: "bytes32",
                        name: "txid",
                        type: "bytes32",
                    },
                    {
                        internalType: "uint256",
                        name: "amount",
                        type: "uint256",
                    },
                ],
                internalType: "struct Input[]",
                name: "",
                type: "tuple[]",
            },
            {
                components: [
                    {
                        internalType: "enum AddrType",
                        name: "txType",
                        type: "uint8",
                    },
                    {
                        internalType: "string",
                        name: "addr",
                        type: "string",
                    },
                    {
                        internalType: "uint256",
                        name: "amount",
                        type: "uint256",
                    },
                ],
                internalType: "struct Output[]",
                name: "",
                type: "tuple[]",
            },
            {
                internalType: "bytes",
                name: "",
                type: "bytes",
            },
            {
                internalType: "enum ProofStatus",
                name: "",
                type: "uint8",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "_btcTxZkpAddr",
                type: "address",
            },
            {
                internalType: "address",
                name: "_btcHeaderAddr",
                type: "address",
            },
        ],
        name: "initialize",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "owner",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "renounceOwnership",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "newBtcHeaderAddr",
                type: "address",
            },
        ],
        name: "setBtcHeaderAddr",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "newBtcTxZkpAddr",
                type: "address",
            },
        ],
        name: "setBtcTxZkpAddr",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "newOwner",
                type: "address",
            },
        ],
        name: "transferOwnership",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "bytes",
                name: "rawTx",
                type: "bytes",
            },
            {
                internalType: "bytes[]",
                name: "utxos",
                type: "bytes[]",
            },
            {
                internalType: "uint32",
                name: "blockHeight",
                type: "uint32",
            },
            {
                internalType: "bytes32[]",
                name: "merkleProof",
                type: "bytes32[]",
            },
            {
                internalType: "bytes32",
                name: "blockMerkleRoot",
                type: "bytes32",
            },
            {
                internalType: "bytes32",
                name: "txHash",
                type: "bytes32",
            },
            {
                internalType: "bool[]",
                name: "proofPositions",
                type: "bool[]",
            },
            {
                internalType: "bytes",
                name: "script",
                type: "bytes",
            },
        ],
        name: "verifyBtcTx",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
];
const _bytecode = "0x60806040523480156200001157600080fd5b50620000226200002860201b60201c565b6200019c565b60006200003a6200013260201b60201c565b90508060000160089054906101000a900460ff161562000086576040517ff92ee8a900000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b67ffffffffffffffff80168160000160009054906101000a900467ffffffffffffffff1667ffffffffffffffff16146200012f5767ffffffffffffffff8160000160006101000a81548167ffffffffffffffff021916908367ffffffffffffffff1602179055507fc7f505b2f371ae2175ee4913f4499e1f2633a7b5936321eed1cdaeb6115181d267ffffffffffffffff6040516200012691906200017f565b60405180910390a15b50565b60007ff0c57e16840df040f15088dc2f81fe391c3923bec73e23a9662efc9c229c6a00905090565b600067ffffffffffffffff82169050919050565b62000179816200015a565b82525050565b60006020820190506200019660008301846200016e565b92915050565b6131d080620001ac6000396000f3fe608060405234801561001057600080fd5b50600436106100cf5760003560e01c80638da5cb5b1161008c578063dfc650c311610066578063dfc650c314610206578063e16c60f714610222578063e6f89d621461023e578063f2fde38b1461025a576100cf565b80638da5cb5b146101ac578063a00ac07a146101ca578063ae88b594146101e8576100cf565b806312c15a94146100d45780632352147814610108578063485cc95514610126578063715018a6146101425780637805ae131461014c5780638618617d1461017c575b600080fd5b6100ee60048036038101906100e99190611885565b610276565b6040516100ff959493929190611c9b565b60405180910390f35b610110610411565b60405161011d9190611d12565b60405180910390f35b610140600480360381019061013b9190611d8b565b6104af565b005b61014a6106c0565b005b61016660048036038101906101619190611dcb565b6106d4565b6040516101739190611df8565b60405180910390f35b61019660048036038101906101919190611dcb565b610854565b6040516101a39190611e51565b60405180910390f35b6101b46108e1565b6040516101c19190611e7b565b60405180910390f35b6101d2610919565b6040516101df9190611e7b565b60405180910390f35b6101f061093d565b6040516101fd9190611e7b565b60405180910390f35b610220600480360381019061021b9190611e96565b610963565b005b61023c60048036038101906102379190611e96565b610a2b565b005b61025860048036038101906102539190612244565b610af0565b005b610274600480360381019061026f9190611e96565b610f24565b005b60006060806060600080600260008981526020019081526020016000206040518060400160405290816000820160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020016001820154815250509050600073ffffffffffffffffffffffffffffffffffffffff16816000015173ffffffffffffffffffffffffffffffffffffffff1603610373576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161036a906123e3565b60405180910390fd5b806000015173ffffffffffffffffffffffffffffffffffffffff16639a6b022a8260200151896040518363ffffffff1660e01b81526004016103b692919061243c565b600060405180830381865afa1580156103d3573d6000803e3d6000fd5b505050506040513d6000823e3d601f19601f820116820180604052508101906103fc9190612855565b95509550955095509550509295509295909350565b6000600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166325159aa96040518163ffffffff1660e01b8152600401602060405180830381865afa158015610480573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906104a49190612939565b63ffffffff16905090565b60006104b9610faa565b905060008160000160089054906101000a900460ff1615905060008260000160009054906101000a900467ffffffffffffffff1690506000808267ffffffffffffffff161480156105075750825b9050600060018367ffffffffffffffff1614801561053c575060003073ffffffffffffffffffffffffffffffffffffffff163b145b90508115801561054a575080155b15610581576040517ff92ee8a900000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b60018560000160006101000a81548167ffffffffffffffff021916908367ffffffffffffffff16021790555083156105d15760018560000160086101000a81548160ff0219169083151502179055505b6105da33610fd2565b866000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555085600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555083156106b75760008560000160086101000a81548160ff0219169083151502179055507fc7f505b2f371ae2175ee4913f4499e1f2633a7b5936321eed1cdaeb6115181d260016040516106ae91906129bf565b60405180910390a15b50505050505050565b6106c8610fe6565b6106d2600061106d565b565b600080600260008481526020019081526020016000206040518060400160405290816000820160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020016001820154815250509050600073ffffffffffffffffffffffffffffffffffffffff16816000015173ffffffffffffffffffffffffffffffffffffffff16036107ca576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016107c1906123e3565b60405180910390fd5b806000015173ffffffffffffffffffffffffffffffffffffffff166346423aa782602001516040518263ffffffff1660e01b815260040161080b91906129da565b602060405180830381865afa158015610828573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061084c91906129f5565b915050919050565b61085c6116c2565b600260008381526020019081526020016000206040518060400160405290816000820160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020016001820154815250509050919050565b6000806108ec611144565b90508060000160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1691505090565b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b61096b610fe6565b8073ffffffffffffffffffffffffffffffffffffffff16600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff167ff25d17fc6d42c45447638392523293eeabae57164a7da009a4e6f88b7270acec60405160405180910390a380600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050565b610a33610fe6565b8073ffffffffffffffffffffffffffffffffffffffff1660008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff167fea6278d98f055ece55f8d20094005a4924b2bd30b65fc17ccf1de9184648470760405160405180910390a3806000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050565b6000885111610b34576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610b2b90612a6e565b60405180910390fd5b6000875111610b78576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610b6f90612ada565b60405180910390fd5b6000855111610bbc576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610bb390612b46565b60405180910390fd5b6000600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166360c4a07c886040518263ffffffff1660e01b8152600401610c199190612b75565b61010060405180830381865afa158015610c37573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610c5b9190612c5a565b905084816040015114610ca3576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610c9a90612cd4565b60405180910390fd5b6000610cb087868661116c565b9050858114610cf4576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610ceb90612b46565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff1660008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1603610d83576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610d7a90612d40565b60405180910390fd5b6000610d8e33611213565b905060008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16636a6382708d8d85896040518563ffffffff1660e01b8152600401610df29493929190612e6c565b6020604051808303816000875af1158015610e11573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610e359190612ecd565b9050604051806040016040528060008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001828152506002600089815260200190815260200160002060008201518160000160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555060208201518160010155905050867f1db25c4b62a6bd8c0d79e76761bf3bafeba5d384f91fd43ff87fc8f4c868f5ed60405160405180910390a2505050505050505050505050565b610f2c610fe6565b600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1603610f9e5760006040517f1e4fbdf7000000000000000000000000000000000000000000000000000000008152600401610f959190611e7b565b60405180910390fd5b610fa78161106d565b50565b60007ff0c57e16840df040f15088dc2f81fe391c3923bec73e23a9662efc9c229c6a00905090565b610fda611240565b610fe381611280565b50565b610fee611306565b73ffffffffffffffffffffffffffffffffffffffff1661100c6108e1565b73ffffffffffffffffffffffffffffffffffffffff161461106b5761102f611306565b6040517f118cdaa70000000000000000000000000000000000000000000000000000000081526004016110629190611e7b565b60405180910390fd5b565b6000611077611144565b905060008160000160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050828260000160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508273ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a3505050565b60007f9016d09d72d40fdae2fd8ceac6b6234c7706214fd39c1cd1e609a0528c199300905090565b6000806111788461130e565b905060005b85518110156111ff5760006111ab87838151811061119e5761119d612efa565b5b602002602001015161130e565b90508482815181106111c0576111bf612efa565b5b6020026020010151156111de576111d7838261136f565b92506111eb565b6111e8818461136f565b92505b5080806111f790612f58565b91505061117d565b506112098161130e565b9150509392505050565b60606112398273ffffffffffffffffffffffffffffffffffffffff16601460ff16611466565b9050919050565b6112486116a2565b61127e576040517fd7e6bcf800000000000000000000000000000000000000000000000000000000815260040160405180910390fd5b565b611288611240565b600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff16036112fa5760006040517f1e4fbdf70000000000000000000000000000000000000000000000000000000081526004016112f19190611e7b565b60405180910390fd5b6113038161106d565b50565b600033905090565b6000808260001c90506000805b60208110156113615780601f6113319190612fa0565b600861133d9190612fd4565b60ff8416901b82179150600883901c9250808061135990612f58565b91505061131b565b508060001b92505050919050565b6000808383604051602001611385929190613037565b604051602081830303815290604052905060006002826040516113a8919061309f565b602060405180830381855afa1580156113c5573d6000803e3d6000fd5b5050506040513d601f19601f820116820180604052508101906113e89190612ecd565b90506002816040516020016113fd91906130b6565b604051602081830303815290604052604051611419919061309f565b602060405180830381855afa158015611436573d6000803e3d6000fd5b5050506040513d601f19601f820116820180604052508101906114599190612ecd565b9050809250505092915050565b6060600060028360026114799190612fd4565b61148391906130d1565b67ffffffffffffffff81111561149c5761149b61175a565b5b6040519080825280601f01601f1916602001820160405280156114ce5781602001600182028036833780820191505090505b5090507f30000000000000000000000000000000000000000000000000000000000000008160008151811061150657611505612efa565b5b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a9053507f78000000000000000000000000000000000000000000000000000000000000008160018151811061156a57611569612efa565b5b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a905350600060018460026115aa9190612fd4565b6115b491906130d1565b90505b6001811115611654577f3031323334353637383961626364656600000000000000000000000000000000600f8616601081106115f6576115f5612efa565b5b1a60f81b82828151811061160d5761160c612efa565b5b60200101907effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916908160001a905350600485901c94508061164d90613105565b90506115b7565b5060008414611698576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161168f9061317a565b60405180910390fd5b8091505092915050565b60006116ac610faa565b60000160089054906101000a900460ff16905090565b6040518060400160405280600073ffffffffffffffffffffffffffffffffffffffff168152602001600080191681525090565b6000604051905090565b600080fd5b600080fd5b6000819050919050565b61171c81611709565b811461172757600080fd5b50565b60008135905061173981611713565b92915050565b600080fd5b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b61179282611749565b810181811067ffffffffffffffff821117156117b1576117b061175a565b5b80604052505050565b60006117c46116f5565b90506117d08282611789565b919050565b600067ffffffffffffffff8211156117f0576117ef61175a565b5b6117f982611749565b9050602081019050919050565b82818337600083830152505050565b6000611828611823846117d5565b6117ba565b90508281526020810184848401111561184457611843611744565b5b61184f848285611806565b509392505050565b600082601f83011261186c5761186b61173f565b5b813561187c848260208601611815565b91505092915050565b6000806040838503121561189c5761189b6116ff565b5b60006118aa8582860161172a565b925050602083013567ffffffffffffffff8111156118cb576118ca611704565b5b6118d785828601611857565b9150509250929050565b6118ea81611709565b82525050565b600081519050919050565b600082825260208201905092915050565b6000819050602082019050919050565b61192581611709565b82525050565b6000819050919050565b61193e8161192b565b82525050565b60408201600082015161195a600085018261191c565b50602082015161196d6020850182611935565b50505050565b600061197f8383611944565b60408301905092915050565b6000602082019050919050565b60006119a3826118f0565b6119ad81856118fb565b93506119b88361190c565b8060005b838110156119e95781516119d08882611973565b97506119db8361198b565b9250506001810190506119bc565b5085935050505092915050565b600081519050919050565b600082825260208201905092915050565b6000819050602082019050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b60088110611a6257611a61611a22565b5b50565b6000819050611a7382611a51565b919050565b6000611a8382611a65565b9050919050565b611a9381611a78565b82525050565b600081519050919050565b600082825260208201905092915050565b60005b83811015611ad3578082015181840152602081019050611ab8565b60008484015250505050565b6000611aea82611a99565b611af48185611aa4565b9350611b04818560208601611ab5565b611b0d81611749565b840191505092915050565b6000606083016000830151611b306000860182611a8a565b5060208301518482036020860152611b488282611adf565b9150506040830151611b5d6040860182611935565b508091505092915050565b6000611b748383611b18565b905092915050565b6000602082019050919050565b6000611b94826119f6565b611b9e8185611a01565b935083602082028501611bb085611a12565b8060005b85811015611bec5784840389528151611bcd8582611b68565b9450611bd883611b7c565b925060208a01995050600181019050611bb4565b50829750879550505050505092915050565b600081519050919050565b600082825260208201905092915050565b6000611c2582611bfe565b611c2f8185611c09565b9350611c3f818560208601611ab5565b611c4881611749565b840191505092915050565b60038110611c6457611c63611a22565b5b50565b6000819050611c7582611c53565b919050565b6000611c8582611c67565b9050919050565b611c9581611c7a565b82525050565b600060a082019050611cb060008301886118e1565b8181036020830152611cc28187611998565b90508181036040830152611cd68186611b89565b90508181036060830152611cea8185611c1a565b9050611cf96080830184611c8c565b9695505050505050565b611d0c8161192b565b82525050565b6000602082019050611d276000830184611d03565b92915050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000611d5882611d2d565b9050919050565b611d6881611d4d565b8114611d7357600080fd5b50565b600081359050611d8581611d5f565b92915050565b60008060408385031215611da257611da16116ff565b5b6000611db085828601611d76565b9250506020611dc185828601611d76565b9150509250929050565b600060208284031215611de157611de06116ff565b5b6000611def8482850161172a565b91505092915050565b6000602082019050611e0d6000830184611c8c565b92915050565b611e1c81611d4d565b82525050565b604082016000820151611e386000850182611e13565b506020820151611e4b602085018261191c565b50505050565b6000604082019050611e666000830184611e22565b92915050565b611e7581611d4d565b82525050565b6000602082019050611e906000830184611e6c565b92915050565b600060208284031215611eac57611eab6116ff565b5b6000611eba84828501611d76565b91505092915050565b600067ffffffffffffffff821115611ede57611edd61175a565b5b611ee782611749565b9050602081019050919050565b6000611f07611f0284611ec3565b6117ba565b905082815260208101848484011115611f2357611f22611744565b5b611f2e848285611806565b509392505050565b600082601f830112611f4b57611f4a61173f565b5b8135611f5b848260208601611ef4565b91505092915050565b600067ffffffffffffffff821115611f7f57611f7e61175a565b5b602082029050602081019050919050565b600080fd5b6000611fa8611fa384611f64565b6117ba565b90508083825260208201905060208402830185811115611fcb57611fca611f90565b5b835b8181101561201257803567ffffffffffffffff811115611ff057611fef61173f565b5b808601611ffd8982611f36565b85526020850194505050602081019050611fcd565b5050509392505050565b600082601f8301126120315761203061173f565b5b8135612041848260208601611f95565b91505092915050565b600063ffffffff82169050919050565b6120638161204a565b811461206e57600080fd5b50565b6000813590506120808161205a565b92915050565b600067ffffffffffffffff8211156120a1576120a061175a565b5b602082029050602081019050919050565b60006120c56120c084612086565b6117ba565b905080838252602082019050602084028301858111156120e8576120e7611f90565b5b835b8181101561211157806120fd888261172a565b8452602084019350506020810190506120ea565b5050509392505050565b600082601f8301126121305761212f61173f565b5b81356121408482602086016120b2565b91505092915050565b600067ffffffffffffffff8211156121645761216361175a565b5b602082029050602081019050919050565b60008115159050919050565b61218a81612175565b811461219557600080fd5b50565b6000813590506121a781612181565b92915050565b60006121c06121bb84612149565b6117ba565b905080838252602082019050602084028301858111156121e3576121e2611f90565b5b835b8181101561220c57806121f88882612198565b8452602084019350506020810190506121e5565b5050509392505050565b600082601f83011261222b5761222a61173f565b5b813561223b8482602086016121ad565b91505092915050565b600080600080600080600080610100898b031215612265576122646116ff565b5b600089013567ffffffffffffffff81111561228357612282611704565b5b61228f8b828c01611f36565b985050602089013567ffffffffffffffff8111156122b0576122af611704565b5b6122bc8b828c0161201c565b97505060406122cd8b828c01612071565b965050606089013567ffffffffffffffff8111156122ee576122ed611704565b5b6122fa8b828c0161211b565b955050608061230b8b828c0161172a565b94505060a061231c8b828c0161172a565b93505060c089013567ffffffffffffffff81111561233d5761233c611704565b5b6123498b828c01612216565b92505060e089013567ffffffffffffffff81111561236a57612369611704565b5b6123768b828c01611f36565b9150509295985092959890939650565b600082825260208201905092915050565b7f5265636f72644e6f74466f756e64000000000000000000000000000000000000600082015250565b60006123cd600e83612386565b91506123d882612397565b602082019050919050565b600060208201905081810360008301526123fc816123c0565b9050919050565b600061240e82611a99565b6124188185612386565b9350612428818560208601611ab5565b61243181611749565b840191505092915050565b600060408201905061245160008301856118e1565b81810360208301526124638184612403565b90509392505050565b60008151905061247b81611713565b92915050565b600067ffffffffffffffff82111561249c5761249b61175a565b5b602082029050602081019050919050565b600080fd5b600080fd5b6124c08161192b565b81146124cb57600080fd5b50565b6000815190506124dd816124b7565b92915050565b6000604082840312156124f9576124f86124ad565b5b61250360406117ba565b905060006125138482850161246c565b6000830152506020612527848285016124ce565b60208301525092915050565b600061254661254184612481565b6117ba565b9050808382526020820190506040840283018581111561256957612568611f90565b5b835b81811015612592578061257e88826124e3565b84526020840193505060408101905061256b565b5050509392505050565b600082601f8301126125b1576125b061173f565b5b81516125c1848260208601612533565b91505092915050565b600067ffffffffffffffff8211156125e5576125e461175a565b5b602082029050602081019050919050565b6008811061260357600080fd5b50565b600081519050612615816125f6565b92915050565b600061262e612629846117d5565b6117ba565b90508281526020810184848401111561264a57612649611744565b5b612655848285611ab5565b509392505050565b600082601f8301126126725761267161173f565b5b815161268284826020860161261b565b91505092915050565b6000606082840312156126a1576126a06124ad565b5b6126ab60606117ba565b905060006126bb84828501612606565b600083015250602082015167ffffffffffffffff8111156126df576126de6124b2565b5b6126eb8482850161265d565b60208301525060406126ff848285016124ce565b60408301525092915050565b600061271e612719846125ca565b6117ba565b9050808382526020820190506020840283018581111561274157612740611f90565b5b835b8181101561278857805167ffffffffffffffff8111156127665761276561173f565b5b808601612773898261268b565b85526020850194505050602081019050612743565b5050509392505050565b600082601f8301126127a7576127a661173f565b5b81516127b784826020860161270b565b91505092915050565b60006127d36127ce84611ec3565b6117ba565b9050828152602081018484840111156127ef576127ee611744565b5b6127fa848285611ab5565b509392505050565b600082601f8301126128175761281661173f565b5b81516128278482602086016127c0565b91505092915050565b6003811061283d57600080fd5b50565b60008151905061284f81612830565b92915050565b600080600080600060a08688031215612871576128706116ff565b5b600061287f8882890161246c565b955050602086015167ffffffffffffffff8111156128a05761289f611704565b5b6128ac8882890161259c565b945050604086015167ffffffffffffffff8111156128cd576128cc611704565b5b6128d988828901612792565b935050606086015167ffffffffffffffff8111156128fa576128f9611704565b5b61290688828901612802565b925050608061291788828901612840565b9150509295509295909350565b6000815190506129338161205a565b92915050565b60006020828403121561294f5761294e6116ff565b5b600061295d84828501612924565b91505092915050565b6000819050919050565b600067ffffffffffffffff82169050919050565b6000819050919050565b60006129a96129a461299f84612966565b612984565b612970565b9050919050565b6129b98161298e565b82525050565b60006020820190506129d460008301846129b0565b92915050565b60006020820190506129ef60008301846118e1565b92915050565b600060208284031215612a0b57612a0a6116ff565b5b6000612a1984828501612840565b91505092915050565b7f496e76616c696452617754780000000000000000000000000000000000000000600082015250565b6000612a58600c83612386565b9150612a6382612a22565b602082019050919050565b60006020820190508181036000830152612a8781612a4b565b9050919050565b7f496e76616c69645574786f730000000000000000000000000000000000000000600082015250565b6000612ac4600c83612386565b9150612acf82612a8e565b602082019050919050565b60006020820190508181036000830152612af381612ab7565b9050919050565b7f496e76616c69644d65726b6c6550726f6f660000000000000000000000000000600082015250565b6000612b30601283612386565b9150612b3b82612afa565b602082019050919050565b60006020820190508181036000830152612b5f81612b23565b9050919050565b612b6f8161204a565b82525050565b6000602082019050612b8a6000830184612b66565b92915050565b60006101008284031215612ba757612ba66124ad565b5b612bb26101006117ba565b90506000612bc284828501612924565b6000830152506020612bd68482850161246c565b6020830152506040612bea8482850161246c565b6040830152506060612bfe84828501612924565b6060830152506080612c1284828501612924565b60808301525060a0612c2684828501612924565b60a08301525060c0612c3a8482850161246c565b60c08301525060e0612c4e84828501612924565b60e08301525092915050565b60006101008284031215612c7157612c706116ff565b5b6000612c7f84828501612b90565b91505092915050565b7f496e76616c6964426c6f636b4d65726b6c65526f6f7400000000000000000000600082015250565b6000612cbe601683612386565b9150612cc982612c88565b602082019050919050565b60006020820190508181036000830152612ced81612cb1565b9050919050565b7f496e76616c696442746354785a6b704164647265737300000000000000000000600082015250565b6000612d2a601683612386565b9150612d3582612cf4565b602082019050919050565b60006020820190508181036000830152612d5981612d1d565b9050919050565b600081519050919050565b600082825260208201905092915050565b6000819050602082019050919050565b600082825260208201905092915050565b6000612da882611bfe565b612db28185612d8c565b9350612dc2818560208601611ab5565b612dcb81611749565b840191505092915050565b6000612de28383612d9d565b905092915050565b6000602082019050919050565b6000612e0282612d60565b612e0c8185612d6b565b935083602082028501612e1e85612d7c565b8060005b85811015612e5a5784840389528151612e3b8582612dd6565b9450612e4683612dea565b925060208a01995050600181019050612e22565b50829750879550505050505092915050565b60006080820190508181036000830152612e868187611c1a565b90508181036020830152612e9a8186612df7565b90508181036040830152612eae8185612403565b90508181036060830152612ec28184611c1a565b905095945050505050565b600060208284031215612ee357612ee26116ff565b5b6000612ef18482850161246c565b91505092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b6000612f638261192b565b91507fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8203612f9557612f94612f29565b5b600182019050919050565b6000612fab8261192b565b9150612fb68361192b565b9250828203905081811115612fce57612fcd612f29565b5b92915050565b6000612fdf8261192b565b9150612fea8361192b565b9250828202612ff88161192b565b9150828204841483151761300f5761300e612f29565b5b5092915050565b6000819050919050565b61303161302c82611709565b613016565b82525050565b60006130438285613020565b6020820191506130538284613020565b6020820191508190509392505050565b600081905092915050565b600061307982611bfe565b6130838185613063565b9350613093818560208601611ab5565b80840191505092915050565b60006130ab828461306e565b915081905092915050565b60006130c28284613020565b60208201915081905092915050565b60006130dc8261192b565b91506130e78361192b565b92508282019050808211156130ff576130fe612f29565b5b92915050565b60006131108261192b565b91506000820361312357613122612f29565b5b600182039050919050565b7f537472696e67733a20686578206c656e67746820696e73756666696369656e74600082015250565b6000613164602083612386565b915061316f8261312e565b602082019050919050565b6000602082019050818103600083015261319381613157565b905091905056fea2646970667358221220adec3f524ac1f2980d083661baaa6e036e0b771276a9301506903dedce49b69564736f6c63430008140033";
const isSuperArgs = (xs) => xs.length > 1;
class BtcTxVerifier__factory extends ContractFactory {
    constructor(...args) {
        if (isSuperArgs(args)) {
            super(...args);
        }
        else {
            super(_abi, _bytecode, args[0]);
        }
    }
    getDeployTransaction(overrides) {
        return super.getDeployTransaction(overrides || {});
    }
    deploy(overrides) {
        return super.deploy(overrides || {});
    }
    connect(runner) {
        return super.connect(runner);
    }
    static createInterface() {
        return new Interface(_abi);
    }
    static connect(address, runner) {
        return new Contract(address, _abi, runner);
    }
}
BtcTxVerifier__factory.bytecode = _bytecode;
BtcTxVerifier__factory.abi = _abi;

/**
 * Tries to understand any kind of contract call error as a potential "revert".
 * If that's a revertion, returns the revert reason.
 */
const errorToRevertedExecution = (error) => {
    if (!isCallException(error))
        return null;
    const callException = error;
    const revertReason = callException.error?.message;
    return revertReason;
};

const connectZkpTxVerifierContract = async (runner) => {
    if (!runner)
        throw new Error("Invalid EVM wallet signer, please connect to a wallet.");
    const network = await runner.provider.getNetwork();
    const activeChain = getChainConfigByChainId(network.chainId);
    if (!activeChain)
        throw new Error("BeL2 ZKP verification is not available on the current EVM network");
    const contractAddress = activeChain.contracts.btcTxVerifier;
    return BtcTxVerifier__factory.connect(contractAddress, runner);
};
const sendBitcoinTransactionVerificationRequest = async (signer, verificationParams) => {
    const verifierContract = await connectZkpTxVerifierContract(signer);
    const { blockHeight, txRawData, utxos, txId, txIds, merkleRoot, leaf, proof, positions } = verificationParams;
    const script = "TODO";
    // Generate the verifyBtcTx() transaction and sends it through the given ethers signer
    const txResponse = await verifierContract.verifyBtcTx.send(txRawData, utxos, blockHeight, proof, merkleRoot, txId, positions, script);
    return txResponse;
};
const getBitcoinTransactionVerificationStatus = async (providerOrSigner, txId) => {
    const verifierContract = await connectZkpTxVerifierContract(providerOrSigner);
    try {
        const rawStatus = await verifierContract.getTxZkpStatus(txId);
        return convertContractStatus(rawStatus);
    }
    catch (e) {
        const revertedReason = errorToRevertedExecution(e);
        if (revertedReason === "RecordNotFound")
            return TransactionVerificationStatus.NotSubmitted;
        else
            return TransactionVerificationStatus.Unknown;
    }
};

class EthersV6TransactionVerification extends TransactionVerification {
    constructor(btcTxId, providerOrSigner) {
        super(btcTxId);
        this.roProvider = providerOrSigner;
    }
    /**
     * Prepares a verification for a given bitcoin transaction id. During this call, the current verification status
     * is first checked so that if a verification has already been requested earlier, the verification state resumes
     * where it was interrupted.
     *
     * @param chainId EVM chain ID on which the verification result gets linked.
     * @param providerOrSigner Read-only EVM wallet provider used to fetch the current verification status, if you want to use your own RPC api or provider. Otherwise, a default RPC API is used.
     */
    static async create(btcTxId, chainId, providerOrSigner) {
        const provider = providerOrSigner || getDefaultEVMProvider(BigInt(chainId));
        const tv = new EthersV6TransactionVerification(btcTxId, provider);
        await tv.checkStatus();
        return tv;
    }
    async checkStatus() {
        const _status = await getBitcoinTransactionVerificationStatus(this.roProvider, this.btcTxId);
        this.status$.next(_status);
    }
    /**
     * Publishes an EVM transaction that requests generation of a ZKP proof for
     * this bitcoin transaction.
     */
    async submitVerificationRequest(signer) {
        // fetch all data required to construct the tx, store in memory
        this.zkpProofParams = await prepareZKPProofParams(this.btcTxId);
        if (!this.zkpProofParams)
            return null;
        return sendBitcoinTransactionVerificationRequest(signer, this.zkpProofParams);
    }
}

const useTransactionVerificationStatus = (btcTxId) => {
    return TransactionVerificationStatus.NotSubmitted;
};

export { EVMProviderType, EthersV6TransactionVerification, TransactionVerification, TransactionVerificationStatus, useTransactionVerificationStatus };
//# sourceMappingURL=index.esm.js.map
