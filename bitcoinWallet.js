const EC = require('elliptic').ec;
const sha256 = require('js-sha256');
const ripemd160 = require('ripemd160');
const base58 = require('bs58')
const ecdsa = new EC('secp256k1');
const profile = require('./userProfile');
const bitcore = require('bitcore-lib');
const axios = require('axios')
const priceApi = require('coingecko-api')


const createPrivateKeyWIF = async (privateKey) => {

    /*
        Generates a WIFPrivatekey ad address from privateKey

        ~ Piotr Warząchowski
    */

    const base = Buffer.from("80" + privateKey.toString('hex'), 'hex');
    const checksum = sha256(Buffer.from(sha256(Buffer.from("80" + privateKey.toString('hex'), 'hex')), 'hex')).substring(0, 8);
    const decoded = base.toString('hex') + checksum;
    const privateKeyWIF = base58.encode(Buffer.from(decoded, 'hex'));
    return privateKeyWIF;
};


const generateBitcoinWalletPair = async (privateKey) => {

    /*
        Generates a keyPair (WIFPrivatekey ad address) from privateKey

        ~ Piotr Warząchowski
    */

    const keys = ecdsa.keyFromPrivate(privateKey);
    const publicKey = keys.getPublic('hex');
    let hash = sha256(Buffer.from(publicKey, 'hex'));
    let publicKeyHash = new ripemd160().update(Buffer.from(hash, 'hex')).digest();
    const base = Buffer.from("00" + publicKeyHash.toString('hex'), 'hex');
    const checksum = sha256(Buffer.from(sha256(Buffer.from("00" + publicKeyHash.toString('hex'), 'hex')), 'hex')).substring(0, 8);
    const publicNotEnceded = base.toString('hex') + checksum;
    const address = base58.encode(Buffer.from(publicNotEnceded, 'hex'));
    const WIFprivateKey = await createPrivateKeyWIF(privateKey);
    return [WIFprivateKey, address];
};


const broadcastBitcoinTransaction = async (recieverAddress, amountToSend) => {
    
    /*
        It sends transaction on a mainnet bitcoin blockchain from wallet,
        that user has generated at a start.

        ~ Piotr Warząchowski
    */

    const keyPair = await generateBitcoinWalletPair(profile.readDatabase().privateKey);
    const satoshiToSend = amountToSend * 100000000; 
    const transaction = new bitcore.Transaction();

    let totalAmountAvailable = 0;
    let inputs = [];
    let inputCount = 0;
    let outputCount = 2;
   
    const utxos = await getUtxos(keyPair[1]);
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
    const fee = transactionSize * 20;

    if (totalAmountAvailable - satoshiToSend - fee  < 0) {
        throw new Error("Balance is too low for this transaction");
    }

    transaction.from(inputs);
    transaction.to(recieverAddress, satoshiToSend);
    transaction.change(keyPair[1]);
    transaction.fee(fee * 20);
    transaction.sign(keyPair[0]);


    const serializedTransaction = transaction.serialize();
    const result = await axios({
        method: "POST",
        url: `https://sochain.com/api/v2/send_tx/BTC`,
        data: {
        tx_hex: serializedTransaction,
        },
    });
        
    
    console.log(result.data);
    return result.data;
};


const broadcastBitcoinTestnetTransaction = async (recieverAddress, amountToSend) => {

    /*
        This code is used for pure tests only, to test how does blockchain transaction work.

        It sends transaction on testnet bitcoin blockchain from wallet having this provate key:
        cPujYF7AtTGUdk3mRQKhfzffdPNF4D1SxKU8oZo5qSGJpYkjiPu9

        ~ Piotr Warząchowski
    */

    const testnetPrivateKeyWIF = 'cPujYF7AtTGUdk3mRQKhfzffdPNF4D1SxKU8oZo5qSGJpYkjiPu9';
    const testnetPrivateKey = bitcore.PrivateKey.fromWIF(testnetPrivateKeyWIF);
    const testnetAddress = testnetPrivateKey.toAddress();
    const addressIn = testnetAddress.toString();
    const satoshiToSend = amountToSend * 100000000; 
    const transaction = new bitcore.Transaction();

    let totalAmountAvailable = 0;
    let inputs = [];
    let inputCount = 0;
    let outputCount = 2;
   

    const utxos = await getTestnetUtxos(addressIn);
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
    const fee = transactionSize * 20;

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
        
    
    console.log(result.data);
    return result.data;
};


const getBitcoinConfirmedBalance = async (bitcoinAddress) => {

    /*
        Gets confirmed bitcoin balance with usage of sochain API.

        ~ Piotr Warząchowski
    */

    const response = await axios.get(`https://sochain.com/api/v2/get_address_balance/BTC/${bitcoinAddress}/1`);
    const priceApiClient = new priceApi();
    const data = await priceApiClient.coins.fetch('bitcoin');
    return [response.data.data.confirmed_balance, (parseFloat(response.data.data.confirmed_balance) * data.data.market_data.current_price.usd).toString()];
};


const getBitcoinUnconfirmedBalance = async (bitcoinAddress) => {

    /*
        Gets unconfirmed bitcoin balance with usage of sochain API.

        ~ Piotr Warząchowski
    */

    const response = await axios.get(`https://sochain.com/api/v2/get_address_balance/BTC/${bitcoinAddress}/0`);
    const priceApiClient = new priceApi();
    const data = await priceApiClient.coins.fetch('bitcoin');
    return [response.data.data.confirmed_balance, (parseFloat(response.data.data.confirmed_balance) * data.data.market_data.current_price.usd).toString()];
};


const getTestnetUtxos = async (bitcoinAddress) => {

    /*
        Gets bitcoinwallet testnet utxos.

        ~ Piotr Warząchowski
    */

	const response = await axios.get(`https://sochain.com/api/v2/get_tx_unspent/BTCTEST/${bitcoinAddress}`);
	return response.data;
};


const getUtxos = async (bitcoinAddress) => {

    /*
        Gets bitcoinwallet mainnet utxos.

        ~ Piotr Warząchowski
    */

	const response = await axios.get(`https://sochain.com/api/v2/get_tx_unspent/BTC/${bitcoinAddress}`);
	return response.data;
};


module.exports = {
    generateBitcoinWalletPair,
    getBitcoinConfirmedBalance,
    getBitcoinUnconfirmedBalance,
    broadcastBitcoinTransaction,
}