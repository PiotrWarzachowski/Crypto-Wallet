const crypto = require('crypto');
const fs = require('fs');
const algorithm = 'aes-256-ctr';

const getSecretKey = () => {
    
    if (!fs.existsSync(`${process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share")}/cryptowallet`)){
        const secretKey = crypto.randomBytes(16).toString('hex');
        fs.writeFileSync(`${process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share")}/cryptowallet`, secretKey, function (err) {
            if (err) throw err;
        });
        
        return secretKey
    }
        
    return fs.readFileSync(`${process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share")}/cryptowallet`, 'utf8')
    
}

const encrypt = (text) => {
    
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, getSecretKey(), iv);
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

    return {
        iv: iv.toString('hex'),
        content: encrypted.toString('hex')
    };
};

const decrypt = (hash) => {

    const decipher = crypto.createDecipheriv(algorithm, getSecretKey(), Buffer.from(hash.iv, 'hex'));
    const decrpyted = Buffer.concat([decipher.update(Buffer.from(hash.content, 'hex')), decipher.final()]);

    return decrpyted.toString();
};

module.exports = {
    encrypt,
    decrypt
}
