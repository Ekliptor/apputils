import * as crypto from "crypto";

export function encryptAes(data: string, ivKeyHex: string, outputEncoding: crypto.HexBase64BinaryEncoding = "base64"): string {
    //data = this.pkcs5Pad(data, 'aes-128-cbc-blocksize')
    let iv = Buffer.from(ivKeyHex, 'hex')
    let key = Buffer.from(ivKeyHex, 'hex')
    let encipher = crypto.createCipheriv('aes-128-ofb', key, iv)
    let encData = encipher.update(data, 'utf8', outputEncoding)
    encData += encipher.final(outputEncoding)
    return encData
}

export function decryptAes(data: string, ivKeyHex: string, outputEncoding: crypto.Utf8AsciiBinaryEncoding = "utf8"): string {
    let iv = Buffer.from(ivKeyHex, 'hex')
    let key = Buffer.from(ivKeyHex, 'hex')
    let decipher = crypto.createDecipheriv('aes-128-ofb', key, iv)
    let decData = decipher.update(data, 'base64', outputEncoding)
    decData += decipher.final(outputEncoding)
    //decData = this.pkcs5Unpad(decData)
    return decData
}