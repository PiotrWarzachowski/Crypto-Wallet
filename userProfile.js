const fs = require('fs');
const db = require('./dbEncryption')

const createUserProfile = () => {
    if (!fs.existsSync('./core')){
        fs.mkdirSync('./core');
        const fileData = db.encrypt(`{"username" : "","hasPrivateKey" : false,"privateKey" : "","transactionsSent" : {"bitcoin" : 0,"ethereum" : 0}}`)
        fs.writeFileSync('./core/userprofile.json', JSON.stringify(fileData), function (err) {
            if (err) throw err;
        });
    }
}

const updateUserProfile = (key, value) => {

    
    let cryptedContent = JSON.parse(fs.readFileSync('./core/userprofile.json', 'utf8'));
    let content = JSON.parse(db.decrypt(cryptedContent));
    if (key != "privatekey"){
        content[key] = value;
        fs.writeFileSync('./core/userprofile.json', JSON.stringify(content));
    }
}

const addPrivateKey = (privateKey) => {
    let cryptedContent = JSON.parse(fs.readFileSync('./core/userprofile.json', 'utf8'));
    let content = JSON.parse(db.decrypt(cryptedContent));
    content.privateKey = privateKey;
    content.hasPrivateKey = true;
    let cryptedNewContent = db.encrypt(JSON.stringify(content));
    fs.writeFileSync('./core/userprofile.json', JSON.stringify(cryptedNewContent));
}

// Function for developers to see decrypted database

const readDatabase = () => {
    let cryptedContent = JSON.parse(fs.readFileSync('./core/userprofile.json', 'utf8'));
    let content = JSON.parse(db.decrypt(cryptedContent));
    console.log(content)
}

module.exports = {
    createUserProfile,
    updateUserProfile,
    addPrivateKey,
}