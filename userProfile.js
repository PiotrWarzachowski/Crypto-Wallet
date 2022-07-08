const fs = require('fs');
const db = require('./dbEncryption')

const createUserProfile = () => {

    if (!fs.existsSync(`${process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share")}/cryptowallet-userprofile`)){
        const fileData = db.encrypt(`{"username" : "","hasPrivateKey" : false,"privateKey" : "","transactionsSent" : {"bitcoin" : 0,"ethereum" : 0}}`)
        fs.writeFileSync(`${process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share")}/cryptowallet-userprofile`, JSON.stringify(fileData), function (err) {
            if (err) throw err;
        });
    }
}

const updateUserProfile = (key, value) => {

    let cryptedContent = JSON.parse(fs.readFileSync(`${process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share")}/cryptowallet-userprofile`, 'utf8'));
    let content = JSON.parse(db.decrypt(cryptedContent));
    if (key != "privatekey"){
        content[key] = value;
        let cryptedNewContent = db.encrypt(JSON.stringify(content));
        fs.writeFileSync(`${process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share")}/cryptowallet-userprofile`, JSON.stringify(cryptedNewContent));
    }
}

const addPrivateKey = (privateKey) => {

    let cryptedContent = JSON.parse(fs.readFileSync(`${process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share")}/cryptowallet-userprofile`, 'utf8'));
    let content = JSON.parse(db.decrypt(cryptedContent));
    if (!content.hasPrivateKey){
        content.privateKey = privateKey;
        content.hasPrivateKey = true;
        let cryptedNewContent = db.encrypt(JSON.stringify(content));
        fs.writeFileSync(`${process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share")}/cryptowallet-userprofile`, JSON.stringify(cryptedNewContent));
    }
}

// Function for developers to see decrypted database

const readDatabase = () => {
    let cryptedContent = JSON.parse(fs.readFileSync(`${process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share")}/cryptowallet-userprofile`, 'utf8'));
    let content = JSON.parse(db.decrypt(cryptedContent));
    return content;
}

module.exports = {
    createUserProfile,
    updateUserProfile,
    addPrivateKey,
    readDatabase,
}