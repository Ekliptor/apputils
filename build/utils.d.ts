/// <reference types="node" />
import * as nconf from "nconf";
import * as winstonGlobal from "winston";
import { sprintf, vsprintf } from "sprintf-js";
import * as EJSON from "ejson";
import stripBom = require("strip-bom");
declare let appDir: string;
declare let logger: winstonGlobal.LoggerInstance;
import * as request from "request";
import * as urlModule from "url";
import * as conf from "./conf";
import * as text from "./text";
import { tail, tailPromise } from "./tail";
import * as date from "./date";
export { conf, text, tail, tailPromise, sprintf, vsprintf, EJSON };
export declare const startDir: string;
export { appDir };
export { logger, nconf };
import * as objects from "./objects";
import * as cloudscraper from "./src/cloudscraper/cloudscraper";
export { objects, cloudscraper };
/**
 * Parse a string to a JSON object. Also works with a nodeJS Buffer
 * @param json
 * @param tryEvalJs
 * @returns {any}
 */
export declare function parseJson(json: any, tryEvalJs?: boolean): any;
export declare function parseEJson(json: any): any;
export declare function stringifyBeautiful(obj: any): string;
/**
 * Restores json while re-creating date objects. An alternative is to use EJSON.
 * @param obj
 * @param dateFields
 */
export declare function restoreJson(obj: any, dateFields?: string[]): any;
export declare function getJsonPostData(postData: any, key?: string): any;
export declare function urlEncode(text: string): string;
export declare function urlDecode(text: string): string;
export declare function toBase64(text: string, from?: string): any;
export declare function fromBase64(text: string, to?: string): string;
export declare function toBase32(text: string, from?: string): any;
export declare function fromBase32(text: string, to?: string): any;
/**
 * Adds the supplied padding to the number until it reaches the desired size (length).
 * @param number
 * @param size
 * @param padding
 */
export declare function padNumber(number: number | string, size: number, padding?: string): string;
/**
 * Return a readable unix time string, for example: 2018-09-16 07:04:30
 * @param withSeconds
 * @param now
 * @param utc
 */
export declare function getUnixTimeStr(withSeconds?: boolean, now?: Date, utc?: boolean): string;
export declare function format(string: string): string;
export declare function escapeRegex(str: string): string;
export declare function getCurrentTick(ms?: boolean): number;
export declare function getRandomString(len: number, hex?: boolean): string;
export declare function substrCount(str: string, find: string): number;
/**
 * Returns a random number between min (inclusive) and max (exclusive)
 * @param min
 * @param max
 * @returns {number}
 */
export declare function getRandom(min: number, max: number): number;
/**
 * Returns a random integer between min (inclusive) and max (exclusive)
 * @param min
 * @param max
 * @returns {int}
 */
export declare function getRandomInt(min: number, max: number): number;
export declare function parseBool(str: any): boolean;
/**
 * Get a new cookie jar
 * @param cookieFilename (optional) Specify a cookies.json file on disk to store & load cookies from.
 * This file MUST already exist! Use utils.file.touch() to ensure this.
 * @param deleteOnError {boolean} delete the file if we can't load cookies from it. If the file has errors saving will fail too.
 * @returns {CookieJar}
 */
export declare function getNewCookieJar(cookieFilename?: string, deleteOnError?: boolean): any;
export interface UtilsHttpCallback {
    (body: string | false, response: request.RequestResponse): void;
}
export declare function getPageCode(address: string, callback: UtilsHttpCallback, options?: any): any;
/**
 * Post data to an address.
 * @param address
 * @param data {Object} the key-value pairs. Can contain files with fs.createReadStream().
 * For advanced files use:
 * fileKey: {
    value:  fs.createReadStream('/dev/urandom'),
    options: {
      filename: 'topsecret.jpg',
      contentType: 'image/jpg' // see https://github.com/broofa/node-mime
    }}
 * @param callback
 * @param options
 * @returns {Object} request
 */
export declare function postData(address: string, data: any, callback: UtilsHttpCallback, options?: any): any;
export declare function postDataAsJson(address: string, obj: any, callback: UtilsHttpCallback, options?: {}): any;
/**
 * Returns the request library for convenience (and to avoid hard dependency on it it projects)
 * @returns {request}
 */
export declare function getRequest(): any;
export declare function toPlainRequest(reqOptions: any): any;
export declare function getPostObject(obj: any, output?: {}): {};
export declare function isWindows(): boolean;
/**
 * Returns the difference between 2 paths strings
 * @param path1
 * @param path2
 * @returns {String} The difference or an empty string if the paths are exactly the same
 */
export declare function getStringDiff(path1: string, path2: string): string;
import * as url from "./url";
export { url };
export declare function parseUrl(linkStr: string): urlModule.UrlWithStringQuery;
export declare function getRootHostname(urlObj: string | urlModule.UrlWithStringQuery, stripSubdomains?: boolean): string;
export declare function getRootHost(urlObj: string | urlModule.UrlWithStringQuery, stripSubdomains?: boolean): string;
export declare function formatUrl(urlObj: urlModule.UrlWithStringQuery, removeFragment?: boolean): string;
export declare function cloneObject(object: any): any;
export declare function uniqueArrayValues<T>(arr: T[]): T[];
export declare function getUniqueUrls(arr: string[]): string[];
/**
 * Test if a phrase is present in a string
 * @param result {string/array} the string or array of strings to search in
 * @param keyword {string} the phrase to search for
 * @param options {string} RegExp options such as "i"
 * @return {bool}
 */
export declare function matchPhrase(result: string | string[], keyword: string, options?: string): boolean;
/**
 * Check if all words from keyword are present in the result strings
 * @param result {string/array} the string or array of strings to search in
 * @param keyword {string} the phrase to search for
 * @param options {string} RegExp options such as "i"
 * @param inOrder {bool} if the keywords have to occur in the same order
 * @param ignoreKeywordRegex {string[]} A list of keywords to ignore (they will pass through as a successfull match)
 * @returns {boolean}
 */
export declare function matchBoolean(result: string | string[], keyword: string, options?: string, inOrder?: boolean, ignoreKeywordRegex?: string[]): boolean;
/**
 * Check if any of the supplied regex matches any of the result strings
 * @param result
 * @param regexStrings
 * @param options regex options, default "i"
 * @returns {boolean}
 */
export declare function matchRegex(result: string[], regexStrings: string[], options?: string): boolean;
/**
 * Check if any of the tags are present in any of the result strings
 * @param result
 * @param tags
 * @returns {boolean}
 */
export declare function matchTag(result: string[], tags: string[]): boolean;
export declare function matchExcludeWord(result: string[], excludeWords: string, options?: string): boolean;
export declare function getWordPositions(text: string, keywordArr: string[], options?: string): any[];
export declare function isAscendingWordOrder(text: string, keywordArr: string[], options?: string): boolean;
export declare function containsWord(str: string, find: string, options?: string): boolean;
export declare function getWordCount(text: string): number;
export interface StringReplaceMap {
    [search: string]: string;
}
export declare function replaceStr(str: string, replaceMap: StringReplaceMap): string;
export declare function escapeHtml(str: string): any;
/**
 * Replaces HTML chars such as &amp; with their Unicode representation.
 * @param str
 * @param trim default true
 */
export declare function decodeHtml(str: string, trim?: boolean): string;
/**
 * promiseDelay returns a promise that gets resolved after the specified time
 */
export declare function promiseDelay<T>(delayMs: number, value?: T): Promise<T>;
/**
 * promiseTimeout implements a timeout that will reject after ms millieseconds
 * if the given promise doesn't resolve before.
 */
export declare function promiseTimeout<T>(ms: number, promise: Promise<T>): Promise<T>;
/**
 * Returns a logger object that can be used instead of console.log().
 * The object will log to our previously configured global app logger
 * @returns {{log: log}}
 */
export declare function getConsoleLogger(): {
    log: () => void;
    debug: () => void;
    info: () => void;
    error: () => void;
    warn: () => void;
};
export declare function restoreLogLines(dbLogDocs: any[]): string[];
export declare function str2ab(str: string, togo?: number): ArrayBuffer;
import * as file from "./file";
import * as test from "./test";
import * as constants from "./const";
import * as db from "./db";
import * as http from "./http";
import { SessionBrowser } from "./SessionBrowser";
import * as dispatcher from "@ekliptor/multihttpdispatcher";
import * as linkExtractor from "./linkExtractor";
import * as crypto from "./crypto";
import * as proc from "./process";
import * as calc from "./calc";
import * as winstonChildProc from "./src/winston-childproc";
import * as winstonMongodb from "./src/winston-mongodb/winston-mongodb";
import "./src/cache/FileHttpCache";
export { file, date, test, constants, db, http, SessionBrowser, dispatcher, linkExtractor, crypto, proc, calc, winstonGlobal, winstonChildProc, winstonMongodb, stripBom };
