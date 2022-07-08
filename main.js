const bitcoin = require('./bitcoinWallet')
const profile = require('./userProfile')
const privateKeyLib = require('./privateKey')

const start = () => {
    profile.createUserProfile()
    const privateKey = privateKeyLib.generatePrivateKey();
    profile.readDatabase()
    profile.addPrivateKey(privateKey);
};

start()
