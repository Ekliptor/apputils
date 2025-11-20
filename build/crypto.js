"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decryptAes = exports.encryptAes = void 0;
const crypto = require("crypto");
function encryptAes(data, ivKeyHex, outputEncoding = "base64") {
    //data = this.pkcs5Pad(data, 'aes-128-cbc-blocksize')
    let iv = Buffer.from(ivKeyHex, 'hex');
    let key = Buffer.from(ivKeyHex, 'hex');
    let encipher = crypto.createCipheriv('aes-128-ofb', key, iv);
    let encData = encipher.update(data, 'utf8', outputEncoding);
    encData += encipher.final(outputEncoding);
    return encData;
}
exports.encryptAes = encryptAes;
function decryptAes(data, ivKeyHex, outputEncoding = "utf8") {
    let iv = Buffer.from(ivKeyHex, 'hex');
    let key = Buffer.from(ivKeyHex, 'hex');
    let decipher = crypto.createDecipheriv('aes-128-ofb', key, iv);
    let decData = decipher.update(data, 'base64', outputEncoding);
    decData += decipher.final(outputEncoding);
    //decData = this.pkcs5Unpad(decData)
    return decData;
}
exports.decryptAes = decryptAes;
//# sourceMappingURL=crypto.js.map