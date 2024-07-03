'use strict';

class StatusChangedEvent extends Event {
    constructor() { super('statusChanged'); }
}

exports.TransactionVerificationStatus = void 0;
(function (TransactionVerificationStatus) {
    TransactionVerificationStatus[TransactionVerificationStatus["NotSubmitted"] = 0] = "NotSubmitted";
    TransactionVerificationStatus[TransactionVerificationStatus["Pending"] = 1] = "Pending";
    TransactionVerificationStatus[TransactionVerificationStatus["Verifying"] = 2] = "Verifying";
    TransactionVerificationStatus[TransactionVerificationStatus["Verified"] = 3] = "Verified";
    TransactionVerificationStatus[TransactionVerificationStatus["VerificationFailed"] = 4] = "VerificationFailed"; // Transaction could not be proven
})(exports.TransactionVerificationStatus || (exports.TransactionVerificationStatus = {}));
class TransactionVerification extends EventTarget {
    constructor(btcTxId) {
        super();
        this.btcTxId = btcTxId;
    }
    static async create(btcTxId) {
        const tv = new TransactionVerification(btcTxId);
        await tv.checkStatus();
        return tv;
    }
    async checkStatus() {
        // fetch current zkp verification status
    }
    async prepareVerificationRequest() {
        // fetch all data required to construct the tx, store in memoty
        // get transaction details from API
        // get block details from tx details
        // get block height and all tx ids of the block
        // use the list of tx ids, and the target tx id, to generate the merkle proof - TBD: only used by loan contract, is this needed for this SDK?
        // fetch tx data for every input utxo
        // provide blockHeight, txRawData, utxos, (proof, merkleRoot, leaf, positions) [merkle proof] to the ZKP contract
        // using the ZKP contract ABI and etherjs, build the EVM transaction that requests ZKP to proof a Bitcoin tx.
        const params = new EVMTransactionRequestParams();
        params.zkpContractAddress = "";
        params.rawTransaction = "";
        return params;
    }
    isSubmitted() {
        // whether ZKP request has been submitted or not
        return false;
    }
    isComplete() {
        // whether ZKP request has been submitted, processed, then either succeeded or failed.
        return false;
    }
    addEventListener(type, handler, options) {
        super.addEventListener(type, handler, options);
        // TODO: for status changed event, start listening to EVM ZKP events
    }
}
class EVMTransactionRequestParams {
}

const useTransactionVerificationStatus = (btcTxId) => {
    return exports.TransactionVerificationStatus.NotSubmitted;
};

exports.EVMTransactionRequestParams = EVMTransactionRequestParams;
exports.StatusChangedEvent = StatusChangedEvent;
exports.TransactionVerification = TransactionVerification;
exports.useTransactionVerificationStatus = useTransactionVerificationStatus;
//# sourceMappingURL=index.cjs.js.map
