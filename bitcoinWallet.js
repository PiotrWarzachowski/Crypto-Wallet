const EC = require('elliptic').ec;
const sha256 = require('js-sha256');
const ripemd160 = require('ripemd160');
const base58 = require('bs58')
const ecdsa = new EC('secp256k1');
const profile = require('./userProfile')
const bitcore = require('bitcore-lib');


const createPrivateKeyWIF = (privateKey) => {
    
    const base = Buffer.from("80" + privateKey.toString('hex'), 'hex');
    const checksum = sha256(Buffer.from(sha256(Buffer.from("80" + privateKey.toString('hex'), 'hex')), 'hex')).substring(0, 8);
    const decoded = base.toString('hex') + checksum;
    const privateKeyWIF = base58.encode(Buffer.from(decoded, 'hex'));
    return privateKeyWIF;
}

const generateBitcoinWalletPair = (privateKey) => {

    const keys = ecdsa.keyFromPrivate(privateKey);
    const publicKey = keys.getPublic('hex');
    let hash = sha256(Buffer.from(publicKey, 'hex'));
    let publicKeyHash = new ripemd160().update(Buffer.from(hash, 'hex')).digest();
    const base = Buffer.from("00" + publicKeyHash.toString('hex'), 'hex');
    const checksum = sha256(Buffer.from(sha256(Buffer.from("00" + publicKeyHash.toString('hex'), 'hex')), 'hex')).substring(0, 8);
    const publicNotEnceded = base.toString('hex') + checksum;
    const address = base58.encode(Buffer.from(publicNotEnceded, 'hex'));
    const WIFprivateKey = createPrivateKeyWIF(privateKey);
    return [WIFprivateKey, address];
}

const broadcastBitcoinTransaction = (recieverAddress, amountToSend) => {
    
    console.log(profile.readDatabase())
    const keyPair = generateBitcoinWalletPair(profile.readDatabase().privateKey)
    console.log(keyPair)
    const privateKey = new bitcore.PrivateKey(keyPair[0]);
    const transaction = new bitcore.Transaction()
    .from()

    onsole.log(transaction)
    
    
}
broadcastBitcoinTransaction()
module.exports = {
    generateBitcoinWalletPair
}