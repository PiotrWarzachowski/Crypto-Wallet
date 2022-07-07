const fs = require('fs');
const db = require('./dbEncryption')

const createUserProfile = () => {
    if (!fs.existsSync(`${process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share")}/userprofile.json'`)){
        const fileData = db.encrypt(`{"username" : "","hasPrivateKey" : false,"privateKey" : "","transactionsSent" : {"bitcoin" : 0,"ethereum" : 0}}`)
        fs.writeFileSync(`${process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share")}/userprofile.json'`, JSON.stringify(fileData), function (err) {
            if (err) throw err;
        });
    }
}

const updateUserProfile = (key, value) => {

    
    let cryptedContent = JSON.parse(fs.readFileSync(`${process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share")}/userprofile.json'`, 'utf8'));
    let content = JSON.parse(db.decrypt(cryptedContent));
    if (key != "privatekey"){
        content[key] = value;
        fs.writeFileSync(`${process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share")}/userprofile.json'`, JSON.stringify(content));
    }
}

const addPrivateKey = (privateKey) => {
    let cryptedContent = JSON.parse(fs.readFileSync(`${process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share")}/userprofile.json'`, 'utf8'));
    let content = JSON.parse(db.decrypt(cryptedContent));
    content.privateKey = privateKey;
    content.hasPrivateKey = true;
    let cryptedNewContent = db.encrypt(JSON.stringify(content));
    fs.writeFileSync(`${process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share")}/userprofile.json'`, JSON.stringify(cryptedNewContent));
}

// Function for developers to see decrypted database

const readDatabase = () => {
    let cryptedContent = JSON.parse(fs.readFileSync(`${process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share")}/userprofile.json'`, 'utf8'));
    let content = JSON.parse(db.decrypt(cryptedContent));
    console.log(content)
}

module.exports = {
    createUserProfile,
    updateUserProfile,
    addPrivateKey,
}
