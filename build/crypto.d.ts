import * as crypto from "crypto";
export declare function encryptAes(data: string, ivKeyHex: string, outputEncoding?: crypto.HexBase64BinaryEncoding): string;
export declare function decryptAes(data: string, ivKeyHex: string, outputEncoding?: crypto.Utf8AsciiBinaryEncoding): string;
