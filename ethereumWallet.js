const ethers = require('ethers')
const profile = require('./userProfile')

const generatEthereumWalletPair = async (privateKey) => {
    
    /*
        Retrieving keypair from a privateKey.
        
        ~Piotr Warząchowski
    */
    
    const wallet = new ethers.Wallet(privateKey)
    return ["0x" + privateKey, wallet.address]

};
