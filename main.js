const bitcoin = require('./bitcoinWallet')
const profile = require('./userProfile')
const privateKeyLib = require('./privateKey')

const start = async () => {
    profile.createUserProfile();
    const privateKey = privateKeyLib.generatePrivateKey();
    profile.addPrivateKey(privateKey);
};

start()
