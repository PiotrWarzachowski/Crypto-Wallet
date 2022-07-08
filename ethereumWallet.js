const ethers = require('ethers')
const profile = require('./userProfile')

const generatEthereumWalletPair = async (privateKey) => {

    const wallet = new ethers.Wallet(privateKey)
    return ["0x" + privateKey, wallet.address]

};