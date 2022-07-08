const secureRandom = require('secure-random');
const fs = require('fs');

const generatePrivateKey = () => {
    let content = JSON.parse(fs.readFileSync(`${process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share")}/cryptowallet-userprofile`, 'utf8'));
    if (!content.hasPrivateKey){
        return secureRandom.randomBuffer(32).toString('hex');
    }
    return false;
}

module.exports = {
    generatePrivateKey
}