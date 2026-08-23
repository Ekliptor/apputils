"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encryptAes = encryptAes;
exports.decryptAes = decryptAes;
var crypto = require("crypto");
function encryptAes(data, ivKeyHex, outputEncoding) {
    if (outputEncoding === void 0) { outputEncoding = "base64"; }
    //data = this.pkcs5Pad(data, 'aes-128-cbc-blocksize')
    var iv = Buffer.from(ivKeyHex, 'hex');
    var key = Buffer.from(ivKeyHex, 'hex');
    var encipher = crypto.createCipheriv('aes-128-ofb', key, iv);
    var encData = encipher.update(data, 'utf8', outputEncoding);
    encData += encipher.final(outputEncoding);
    return encData;
}
function decryptAes(data, ivKeyHex, outputEncoding) {
    if (outputEncoding === void 0) { outputEncoding = "utf8"; }
    var iv = Buffer.from(ivKeyHex, 'hex');
    var key = Buffer.from(ivKeyHex, 'hex');
    var decipher = crypto.createDecipheriv('aes-128-ofb', key, iv);
    var decData = decipher.update(data, 'base64', outputEncoding);
    decData += decipher.final(outputEncoding);
    //decData = this.pkcs5Unpad(decData)
    return decData;
}
