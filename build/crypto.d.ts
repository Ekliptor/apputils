import * as crypto from "crypto";
export declare function encryptAes(data: string, ivKeyHex: string, outputEncoding?: crypto.BinaryToTextEncoding): string;
export declare function decryptAes(data: string, ivKeyHex: string, outputEncoding?: crypto.Encoding): string;
