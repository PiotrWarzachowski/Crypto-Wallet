const EC = require('elliptic').ec;
const sha256 = require('js-sha256');
const ripemd160 = require('ripemd160');
const base58 = require('bs58')
const ecdsa = new EC('secp256k1');
const profile = require('./userProfile');
const bitcore = require('bitcore-lib');
const axios = require('axios')

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
    insight.getUnspentUtxos()
    
    
}

const broadcastBitcoinTestnetTransaction = async (recieverAddress, amountToSend) => {

    const testnetPrivateKeyWIF = 'cPujYF7AtTGUdk3mRQKhfzffdPNF4D1SxKU8oZo5qSGJpYkjiPu9';
    const testnetPrivateKey = bitcore.PrivateKey.fromWIF(testnetPrivateKeyWIF)
    const testnetAddress = testnetPrivateKey.toAddress()
    const addressIn = testnetAddress.toString()
    const satoshiToSend = amountToSend * 100000000; 
    let fee = 0; 
    let inputCount = 0;
    let outputCount = 2
    const transaction = new bitcore.Transaction();
    let totalAmountAvailable = 0;
    let inputs = [];
   

    utxos = await getTestnetUtxos(addressIn);
    utxos.data.txs.forEach(async (element) => {
        let utxo = {};
        utxo.satoshis = Math.floor(Number(element.value) * 100000000);
        utxo.script = element.script_hex;
        utxo.address = utxos.data.address;
        utxo.txId = element.txid;
        utxo.outputIndex = element.output_no;
        totalAmountAvailable += utxo.satoshis;
        inputCount += 1;
        inputs.push(utxo);
    });
    

    transactionSize = inputCount * 146 + outputCount * 34 + 10 - inputCount;
    fee = transactionSize * 20
    if (totalAmountAvailable - satoshiToSend - fee  < 0) {
        throw new Error("Balance is too low for this transaction");
    }

    transaction.from(inputs);
    transaction.to(recieverAddress, satoshiToSend);
    transaction.change(addressIn);
    transaction.fee(fee * 20);
    transaction.sign(testnetPrivateKeyWIF);


    const serializedTransaction = transaction.serialize();
    const result = await axios({
        method: "POST",
        url: `https://sochain.com/api/v2/send_tx/BTCTEST`,
        data: {
        tx_hex: serializedTransaction,
        },
    });
        
    
    console.log(result.data)
    return result.data;
} 


const getTestnetUtxos = async (bitcoinAddress) => {
    try {
		const response = await axios.get(`https://sochain.com/api/v2/get_tx_unspent/BTCTEST/${bitcoinAddress}`);
		return response.data;
	}
	catch (error) {
        return error
		console.log(error);
	}
   
}
broadcastBitcoinTestnetTransaction('mtBHxPJcqNnddMvDn4pcka5GEvRSHAgWWy', 0.001)

module.exports = {
    generateBitcoinWalletPair
}