const SHA256 = require('sha256');
const ip = require('ip');

function Blockchain() {
    this.chain = [];
    this.CurrentNetworkNode = "http://"+ip.address().toString()+":8080";
    this.AllNetworkNodes = [];
    this.createNewBlock(85431, '0', '0', '0', '0', '0', '0', '0', '0', '0000', '0000');//This is genesis block.
};//This is where data is stored in blockchain.


Blockchain.prototype.createNewBlock = function (nonce, name, gender, date, ssn, charge, caseNo, offdate, disDate, previousBlockHash, hash) {
    const newBlock = {
        Index: this.chain.length + 1,
        Nonce: nonce,
        Timestamp: Date(),
        Name: name,
        Gender: gender,
        DateOfBirth: date,
        SSN: ssn,
        Charge: charge,
        CaseNo: caseNo,
        OffenseDate: offdate,
        DisposedDate: disDate,
        CurrentBlockHash: hash,
        PreviousBlockHash: previousBlockHash,
    };

    this.chain.push(newBlock);
    return newBlock;
};//This is the method to add criminal data to block.

Blockchain.prototype.getLastBlock = function () {
    return this.chain[this.chain.length - 1];
};//This is the method to get lastest block.

Blockchain.prototype.hashBlock = function (previousBLockHash, currentBlockData, nonce) {
    const stringdata = previousBLockHash + nonce.toString() + JSON.stringify(currentBlockData);
    const hash = SHA256(stringdata);
    return hash;
};//This is SHA256 methods to the data.

Blockchain.prototype.proofOfWork = function (previousBlockHash, currentBlockData) {
    let nonce = 0;
    let hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
    while (hash.substring(0, 4) !== '0000') {
        nonce++;
        hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
    }

    return nonce;
};//This method is to strenghten the blockchain security.

Blockchain.prototype.isChainValid = function (blockchain) {
    let validChain = true;
    let bchain = blockchain;
    for (var i = 1; i < bchain.length; i++) {
        const curBlock = bchain[i];
        const preBlock = bchain[i - 1];
        const blockHash = this.hashBlock(preBlock['CurrentBlockHash'], { Index: curBlock['Index'], Name: curBlock['Name'], Gender: curBlock['Gender'], DateOfBirth: curBlock['DateOfBirth'], SSN: curBlock['SSN'], Charge: curBlock['Charge'], CaseNo: curBlock['CaseNo'], OffenseDate: curBlock['OffenseDate'], DisposedDate: curBlock["DisposedDate"] }, curBlock['Nonce']);
        if (blockHash.substring(0, 4) !== '0000') validChain = false;
        if (curBlock['PreviousBlockHash'] !== preBlock['CurrentBlockHash']) validChain = false;
    };

    const genesisBlock = bchain[0];
    const correctNonce = genesisBlock['Nonce'] === 85431;
    const correctPreviousHash = genesisBlock['PreviousBlockHash'] === '0000';
    const correctHash = genesisBlock['CurrentBlockHash'] === '0000';

    if (!correctNonce || !correctPreviousHash || !correctHash)
        validChain = false;

    return validChain;
};//This method is to check the chain validity.

Blockchain.prototype.getBlock = function (blockHash) {
    let correctBlock = null;
    this.chain.forEach(block => {
        if (block.hash === blockHash) correctBlock = block;
    });
    return correctBlock;
};//This methods is to get the block.


module.exports = Blockchain;