const secureRandom = require('secure-random');
const fs = require('fs');

const generatePrivateKey = () => {
    let content = JSON.parse(fs.readFileSync('./core/userprofile.json', 'utf8'));
    if (!content.hasPrivateKey){
        return secureRandom.randomBuffer(32).toString('hex');
    }
    return false;
}

module.exports = {
    generatePrivateKey
}