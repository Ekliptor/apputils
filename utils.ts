"use strict";

// done by projects which include this one
//require('source-map-support').install();
// we currently compile this module and always include the compiled code (also in typescript projects)
// otherwise we need a fork with another name so we can require the right one in every ts/js project
// IMPORTANT: never use "this" in exported functions, because we might be bound to a different context

import * as nconf from "nconf";
import * as winstonGlobal from "winston";
//let appRoot = require('app-root-path')
import * as path from "path";
import * as fs from "fs";
import * as base64url from "base64-url";
import * as base32  from "hi-base32";
import * as iconv from "iconv-lite";
import * as escapeHtmlMod from "escape-html";
import * as vm from "vm";
import * as FileCookieStore from "tough-cookie-filestore";
import {sprintf, vsprintf} from "sprintf-js";
import * as EJSON from "ejson";
//import {strip_bom} from "strip-bom"; // doesn't work
import stripBom = require("strip-bom");
import * as entities from"entities";

let useWinston = true
let isExpress = false
let appDir = path.dirname(require.main.filename);
let logger: winstonGlobal.LoggerInstance = null; // ensure we have defined this before functions using it


const sepStr = '\\' + path.sep;
if (global["appRootPath"])
    appDir = global["appRootPath"]
else if (appDir.match(sepStr + '.meteor' + sepStr + 'local' + sepStr + 'build$')) // fix for meteor apps
    appDir = appDir.replace(new RegExp(sepStr + '.meteor' + sepStr + 'local' + sepStr + 'build$'), path.sep + 'private')
else if (appDir.match(sepStr + 'bin$')) { // fix for express apps
    appDir = appDir.replace(new RegExp(sepStr + 'bin$'), path.sep + 'src')
    //useWinston = false // express already comes with morgan logger, but that only logs HTTP requests
    isExpress = true
}

// load config
let configFile = require(appDir + path.sep + 'config') // .js or .ts
const saveConfigFile = "config.json";
if (fs.existsSync(saveConfigFile) === false || parseJson(fs.readFileSync(saveConfigFile, {encoding: "utf8"})) === null) {
    fs.writeFileSync(saveConfigFile, "{}",{encoding: "utf8"}); // crash if we can't write to our working dir
}
nconf.argv()
    .env()
    //.file('app', appRoot.path + '/config.json')
    //.file('utils', appRoot.path + '/node_modules/apputils/config.json') // moved to utils.js
    //.file('app', appDir + path.sep + 'config.json') // needs at least 1 store to be able to save (temp) config // store in working dir
    .file({
        file: saveConfigFile,
        format: {
            // TODO allow hjson as an alternative to place comments in config? http://hjson.org/
            stringify: JSON.stringify,
            parse: JSON.parse
        }
    })
    .defaults(configFile.config) // defaults must be set last or else we can't override values we set in app (such as port)
    /*
    .load((err) => {
        console.log("LOADED")
        if (err)
            throw err;
    })*/

if (process.env.PORT)
    nconf.set('port', process.env.PORT)
if (process.env.HOST)
    nconf.set('host', process.env.HOST)
if (configFile.reload) {
    configFile.reload({
        protocol: nconf.get('protocol'),
        host: nconf.get('host'),
        port: nconf.get('port'),
        pathRoot: nconf.get('pathRoot')
    }, (updatedProps) => {
        for (let prop in updatedProps)
            nconf.set(prop, updatedProps[prop])
    })
}
logger = require(useWinston ? './Logger.js' : './LoggerStub.js')
if (typeof process.getuid === 'function' && process.getuid() === 0 && !process.env.ALLOW_ROOT) {
    console.error('Refusing to run NodeJS app as root') // logger has a dependency on this file (which can't be loaded because of this line)
    process.exit(1)
}

import * as request from "request";
import * as urlModule from "url";

import * as conf from "./conf";
import * as text from "./text";
import {tail, tailPromise} from "./tail";
import * as date from "./date";
export {conf, text, tail, tailPromise, sprintf, vsprintf, EJSON};

export const startDir = appDir; // require() calls go into this dir, requests for resources into appDir
if (isExpress) {
    if (appDir.match(sepStr + 'build' + sepStr + '?.+$')) // we have to fix the bin/www start dir
        appDir = appDir.replace(new RegExp(sepStr + 'build' + sepStr + '?.+$'), '')
}
else if (appDir.match(sepStr + 'build' + sepStr + '?$')) // fix compiled (TypeScript) apps // do this after we load config.js above
    appDir = appDir.replace(new RegExp(sepStr + 'build' + sepStr + '?$'), '')

if (isExpress)
    appDir = appDir.replace(new RegExp('\\' + path.sep + 'src'), path.sep)
if (appDir.substr(-1) !== path.sep)
    appDir += path.sep
export {appDir};
export {logger, nconf}

import * as mime from "mime";
import * as objects from "./objects"; // include this after requiring the above objects because we modify them too
import * as cloudscraper from "./src/cloudscraper/cloudscraper";
export {objects, cloudscraper};

if (typeof nconf.get('http:timeoutMs') === 'undefined')
    nconf.add('utilsDefaults', {type: 'literal', store: require(__dirname + '/config.js').config})
if (nconf.get('debug')) { // require() caches includes, so this is only called once
    process.on('unhandledRejection', (reason, promise) => { // also see 'rejectionHandled'
        logger.warn('Unhandled promise rejection', reason)
    })
}

/**
 * Parse a string to a JSON object. Also works with a nodeJS Buffer
 * @param json
 * @param tryEvalJs
 * @returns {any}
 */
export function parseJson(json: any, tryEvalJs = false) {
    // for redis and client-server we need a JSON representation for Dates: "{"mydate":"2017-01-23T13:39:05.443Z"}"
    // append someting to the key? or check the value via regex (slow?) ? or just a function/parameter converting it back to Date?
    // solved by using EJSON
    try {
        return JSON.parse(json) // TODO should be safe to always use EJSON. just a bit slower
    } catch (error) {
        if (tryEvalJs !== true) {
            if (logger) { // undefined while loading config files
                logger.error('Error parsing JSON: ' + error)
                logger.error("JSON string: " + json)
            }
            return null
        }
    }
    // try parsing a string with no "" around keys, for example: {foo: "abc"}
    let sandbox: any = {
        // custom js properties for global context
        document: {}
    }
    vm.runInNewContext('document.json = ' + json, sandbox)
    if (!sandbox.document.json)
        return null
    return sandbox.document.json // return it from our global context
};

export function parseEJson(json: any) {
    try {
        return EJSON.parse(json)
    } catch (error) {
        logger.error('Error parsing EJSON: ' + error)
        logger.error("EJSON string: " + json)
        return null
    }
}

/*
// doesn't work, because Date.prototype.toJSON() get's called before and MUST return a string
export function stringify(obj) {
    return JSON.stringify(obj, (key, value) => {
        if (value instanceof Date)
            return {$date: value.getTime()}
        return value;
    })
}
*/

export function stringifyBeautiful(obj: any) {
    return JSON.stringify(obj, null, 4);
}

/**
 * Restores json while re-creating date objects. An alternative is to use EJSON.
 * @param obj
 * @param dateFields
 */
export function restoreJson(obj: any, dateFields: string[] = []) {
    for (let prop of dateFields)
    {
        if (obj[prop])
            obj[prop] = new Date(obj[prop])
    }
    return obj
}

export function getJsonPostData(postData: any, key = 'data') {
    if (postData == null)
        return null
    if (Array.isArray(postData[key]))
        postData = postData[key][0] // "form" of multihttpdispatcher returns array
    else
        postData = postData[key]
    if (typeof postData === 'string') // might already have been parsed
        postData = parseJson(postData)
    return postData
}

export function urlEncode(text: string) {
    return encodeURIComponent(text).replace(/%20/g, '+')
}

export function urlDecode(text: string) {
    return decodeURIComponent(text.replace(/\+/g, '%20'))
}

export function toBase64(text: string, from = 'utf8') {
    if (from === "base64")
        return base64url.escape(text)
    return base64url.escape(new Buffer(text, from).toString('base64'))
}

export function fromBase64(text: string, to = 'utf8') {
    return new Buffer(base64url.unescape(text), 'base64').toString(to)
}

export function toBase32(text: string, from = 'utf8') {
    return base32.encode(new Buffer(text, from))
}

export function fromBase32(text: string, to = 'utf8') {
    return base32.decode(text).toString(to)
}

/**
 * Adds the supplied padding to the number until it reaches the desired size (length).
 * @param number
 * @param size
 * @param padding
 */
export function padNumber(number: number | string, size: number, padding: string = "0"): string {
    let str
    if (typeof number === 'number')
        str = number.toString()
    else
        str = number
    while (str.length < size)
        str = padding + str
    return str
}

/**
 * Return a readable unix time string, for example: 2018-09-16 07:04:30
 * @param withSeconds
 * @param now
 * @param utc
 */
export function getUnixTimeStr(withSeconds = false, now = new Date(), utc = false): string {
    return date.toDateTimeStr(now, withSeconds, utc);
}

export function format(string: string) {
    let start = 0
    for (let i = 1; i < arguments.length; i++)
    {
        let search = "%" + i
        start = string.indexOf(search, start)
        if (start === -1)
            break
        start += 2
        string = string.replace(search, arguments[i])
    }
    return string
}

export function escapeRegex(str: string) { // in here for legacy reasons
    return text.escapeRegex(str)
}

export function getCurrentTick(ms = true) {
    if (ms === true)
        return Date.now()
    return Math.round(Date.now() / 1000.0)
}

export function getRandomString(len: number, hex = false) {
    let chars = hex ? '1234567890ABCDEF' : '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    let random = ''
    for (let i = 0; i < len; i++)
        random += chars.charAt(Math.floor(Math.random() * chars.length))
    return random
}

export function substrCount(str: string, find: string) {
    return text.substrCount(str, find);
}

/**
 * Returns a random number between min (inclusive) and max (exclusive)
 * @param min
 * @param max
 * @returns {number}
 */
export function getRandom(min: number, max: number) {
    return Math.random() * (max - min) + min
}

/**
 * Returns a random integer between min (inclusive) and max (exclusive)
 * @param min
 * @param max
 * @returns {int}
 */
export function getRandomInt(min: number, max: number) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min)) + min
}

export function parseBool(str: any) {
    let type = typeof str
    if (type === 'boolean')
        return str
    if (type === 'number')
        return str > 0
    if (type !== 'string')
        return false
    str = str.toLowerCase()
    return str === '1' || str === 'on' || str === 'true'
}

/*
 export function getRequestOptions(address, options) {
    let urlParts = urlModule.parse(address)
    for (let part of ['protocol', 'hostname', 'port', 'path', 'auth'])
    {
        if (options[part] != null && urlParts[part] == null)
            options[part] = urlParts[part]
    }
    return options
}
*/

/**
 * Get a new cookie jar
 * @param cookieFilename (optional) Specify a cookies.json file on disk to store & load cookies from.
 * This file MUST already exist! Use utils.file.touch() to ensure this.
 * @param deleteOnError {boolean} delete the file if we can't load cookies from it. If the file has errors saving will fail too.
 * @returns {CookieJar}
 */
export function getNewCookieJar(cookieFilename = "", deleteOnError = true) {
    if (!cookieFilename)
        return request.jar()
    try {
        return request.jar(new FileCookieStore(cookieFilename))
    }
    catch (e) {
        logger.error("Error loading cookie jar from disk: %s", cookieFilename, e)
        if (deleteOnError) {
            fs.unlink(cookieFilename, (err) => {
                if (err)
                    logger.error("Error deleting invalid cookie jar from disk: %s", cookieFilename, err)
            })
        }
        return request.jar()
    }
}

let prepareRequest = function(address: string, options) {
    if (typeof options.retry !== 'boolean')
        options.retry = true
    if (typeof options.retryWaitMs !== 'number')
        options.retryWaitMs = 5000
    if (typeof options.cookieJar !== 'object')
        options.cookieJar = options.jar ? options.jar : getNewCookieJar()
    if (typeof options.cookies === 'object') {
        let urlParts = urlModule.parse(address)
        let rootUrl = urlParts.protocol + '//' + urlParts.host // we st the cookies for the root of the current request path (in case of rediects)
        for (let cookie of options.cookies)
            options.cookieJar.setCookie(request.cookie(cookie), rootUrl)
    }
    if (typeof options.headers !== 'object')
        options.headers = {}
    if (typeof options.headers['User-Agent'] !== 'string')
        options.headers['User-Agent'] = nconf.get('http:userAgent')
    if (typeof options.headers['Accept'] !== 'string')
        options.headers['Accept'] = nconf.get('http:Accept')
    return options
}

let handleIsoEncoding = function(body: string, response: RequestResponse) {
    // handle non-utf8 responses
    // the proper way would be to pass encoding: null and detect them afterwards. but we use utf8 99% of the time
    // only looking at headers should be ok http://stackoverflow.com/questions/7102925/prefer-charset-declaration-in-html-meta-tag-or-http-header

    // priority
    // 1. http header
    // 2. BOM (we currently ignore)
    // 3. meta charset (the first one determines it)

    let bufferToString = (buffer, encoding) => {
        try {
            let str = iconv.decode(buffer, encoding) // default utf8 // this sometimes caused crashes in toString(). why?
            //if (encoding === "utf8")
                //str = stripBom(str); // BOM is optional, sometimes causes problems // better let the dev decide via utils.stripBom()
            return str;
        }
        catch (e) {
            logger.error("Exception on handling http response enconding", e.message, e.stack);
            return "";
        }
    }

    let getContentTypeFromMeta = (buffer) => {
        let tempStr = bufferToString(buffer, 'utf8')
        let metaType = text.getMetaContentType(tempStr)
        if (metaType !== "iso")
            return tempStr // assume utf8 as default just as request does
        return bufferToString(buffer, 'ISO-8859-1')
    }

    let buffer = new Buffer(body)
    if (!response.headers['content-type'])
        return getContentTypeFromMeta(buffer)
    let type = response.headers['content-type'].toLowerCase() // header keys are always lowercase by nodejs, but NOT the values
    if (type.substr(0, 16) === "application/json")
        return bufferToString(buffer, 'utf8')
    if (type.substr(0, 5) !== 'text/')
        return body // binary
    if (type.indexOf("charset") == -1)
        return getContentTypeFromMeta(buffer)

    if (type.indexOf('iso-') === -1)
        return bufferToString(buffer, 'utf8')
    return bufferToString(buffer, 'ISO-8859-1')
}

export interface UtilsHttpCallback {
    // if body is false then response is: error: any;
    (body: string/* | Buffer*/ | false, response: request.RequestResponse): void;
}

export function getPageCode(address: string, callback: UtilsHttpCallback, options: any = {}) {
    options = prepareRequest(address, options)
    let requestFunction = request.get
    let reqOptions: any = {
        url: address,
        gzip: true,
        timeout: typeof options.timeout !== 'number' ? nconf.get('http:timeoutMs') : options.timeout,
        strictSSL: typeof options.skipCertificateCheck !== 'boolean' || options.skipCertificateCheck !== true,
        followRedirect: typeof options.followRedirect !== 'boolean' || options.followRedirect === true,
        maxRedirects: typeof options.maxRedirects !== 'number' ? 10 : options.maxRedirects,
        followAllRedirects: typeof options.followRedirect !== 'boolean' || options.followRedirect === true, // follow non-GET HTTP 3xx responses as redirects
        headers: options.headers,
        jar: options.cookieJar,
        proxy: options.proxy,
        localAddress: options.localAddress,
        forever: options.forever,
        logger: typeof options.logger === "object" ? options.logger : logger
    }
    if (options.encoding)
        reqOptions.encoding = options.encoding
    else if (reqOptions.encoding === undefined)
        reqOptions.encoding = null // binary as default to handle ISO
    if (options.cloudscraper === true) {
        requestFunction = cloudscraper.request
        reqOptions.method = 'GET'
        reqOptions.solveCloudflareCaptcha = options.solveCloudflareCaptcha
    }
    if (options.method == 'DELETE')
        requestFunction = request.delete
    return requestFunction(reqOptions,
        (error, response, body) => {
            if (error) {
                if (options.retry === true && /*error.indexOf('ENOTFOUND') === -1*/error.code  === 'ETIMEDOUT') {
                    options.retry = false
                    reqOptions.logger.debug('retrying timed out GET request to %s', address)
                    setTimeout(() => {
                        getPageCode(address, callback, options)
                    }, options.retryWaitMs)
                    return
                }
                if (options.cloudscraper === true && error.errorType != 0)
                    error.cloudscraperError = true // abort all reqs for this domain
                reqOptions.logger.error('Error getting page code of ' + address, error)
                if (typeof callback === 'function')
                    callback(false, error)
            }
            else if (typeof callback === 'function') {
                if(options.skipDecoding !== true) {
                    body = reqOptions.encoding ? body : handleIsoEncoding(body, response)
                }
                callback(body, response)
            }
        }
    )
}

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
export function postData(address: string, data: any, callback: UtilsHttpCallback, options: any = {}) {
    options = prepareRequest(address, options)
    let requestFunction = request.post
    let reqOptions: any = {
        url: address,
        gzip: true,
        timeout: typeof options.timeout !== 'number' ? nconf.get('http:timeoutMs') : options.timeout,
        strictSSL: typeof options.skipCertificateCheck !== 'boolean' || options.skipCertificateCheck !== true,
        followRedirect: typeof options.followRedirect !== 'boolean' || options.followRedirect === true,
        maxRedirects: typeof options.maxRedirects !== 'number' ? 10 : options.maxRedirects,
        followAllRedirects: typeof options.followRedirect !== 'boolean' || options.followRedirect === true, // follow non-GET HTTP 3xx responses as redirects
        headers: options.headers,
        jar: options.cookieJar,
        proxy: options.proxy,
        localAddress: options.localAddress,
        forever: options.forever,
        logger: typeof options.logger === "object" ? options.logger : logger
    }
    if (options.encoding)
        reqOptions.encoding = options.encoding
    else if (reqOptions.encoding === undefined)
        reqOptions.encoding = null // binary as default to handle ISO
    if(options.postJson === true)
        reqOptions.json = data
    else if (options.urlencoded === true)
        reqOptions.form = data
    else { // our default is multipart post
        //let dataCopy = JSON.parse(JSON.stringify(data)) // copy object // nice idea, but ruins our ReadStreams for uploads
        reqOptions.formData = getPostObject(data)
    }
    if (options.cloudscraper === true) {
        if (options.urlencoded !== true)
            throw "POST requests with cloudscraper can only be form-data url-encoded (ToDo improve this)"
        requestFunction = cloudscraper.request
        reqOptions.method = 'POST'
        reqOptions.solveCloudflareCaptcha = options.solveCloudflareCaptcha
    }
    if (options.method == 'DELETE')
        requestFunction = request.delete
    return requestFunction(reqOptions,
        (error, response, body) => {
            if (error) {
                if (options.retry === true && /*error.indexOf('ENOTFOUND') === -1*/error.code  === 'ETIMEDOUT') {
                    options.retry = false
                    reqOptions.logger.debug('retrying timed out POST request to %s', address)
                    setTimeout(() => {
                        postData(address, data, callback, options)
                    }, options.retryWaitMs)
                    return
                }
                if (options.cloudscraper === true && error.errorType != 0)
                    error.cloudscraperError = true // abort all reqs for this domain
                reqOptions.logger.error('Error posting data to ' + address, data,  error)
                if (typeof callback === 'function')
                    callback(false, error)
            }
            else if (typeof callback === 'function') {
                if(!options.postJson && options.skipDecoding !== true){
                    body = reqOptions.encoding ? body : handleIsoEncoding(body, response)
                }
                callback(body, response)
            }
        }
    )
}

export function postDataAsJson(address: string, obj: any, callback: UtilsHttpCallback, options = {}) {
    let json
    try {
        json = JSON.stringify(obj)
    } catch (error) {
        return false
    }
    return postData(address, {data: json}, callback, options)
}

/**
 * Returns the request library for convenience (and to avoid hard dependency on it it projects)
 * @returns {request}
 */
export function getRequest() {
    return request
}

export function toPlainRequest(reqOptions) {
    reqOptions.strictSSL = typeof reqOptions.skipCertificateCheck !== 'boolean' || reqOptions.skipCertificateCheck !== true;
    delete reqOptions.skipCertificateCheck
    reqOptions.followAllRedirects = typeof reqOptions.followRedirect !== 'boolean' || reqOptions.followRedirect === true;
    delete reqOptions.followRedirect
    reqOptions.jar = reqOptions.cookieJar
    delete reqOptions.cookieJar
    return reqOptions
}

export function getPostObject(obj: any, output = {}) {
    for (let i in obj) {
        let type = typeof obj[i]
        if (type === 'boolean')
            output[i] = obj[i] === true ? 'true' : 'false' // boolean handling buggy, casues type error
        else if (type === 'object') {
            if (obj[i] === null)
                output[i] = 'null'
            else if (typeof obj[i].pipe !== 'function')
                // HTTP allows posting multiple values under the same key. but we convert arrays to JSON to easier handle them as JS objects
                // HTTP has no syntax to post nested objects (only key-value pairs)
                output[i] = obj[i].hasOwnProperty('value') ? obj[i] : JSON.stringify(obj[i])
            else { // this object is a ReadStream (file)
                output[i] = obj[i]
                if (i === 'value' && typeof obj.options === 'object' && obj.options.contentType == null)
                    obj.options.contentType = mime.lookup(obj[i].path)
            }
        }
        else if (type !== 'function')
            output[i] = obj[i]
    }
    return output
}

export function isWindows() {
    return process.platform.match("^win") !== null
}

/**
 * Returns the difference between 2 paths strings
 * @param path1
 * @param path2
 * @returns {String} The difference or an empty string if the paths are exactly the same
 */
export function getStringDiff(path1: string, path2: string) {
    if (path1.length > path2.length) { // take path1 as the shorter one
        let tempPath = path2
        path2 = path1
        path1 = tempPath
    }
    while (path1.length > 0)
    {
        if (path1[0] !== path2[0])
            return path2
        path1 = path1.substr(1)
        path2 = path2.substr(1)
    }
    return ''
}

// moved all url functions. keep them here for legacy reasons
import * as url from "./url";
export {url};
export function parseUrl(linkStr: string) {
    return url.parseUrl(linkStr)
}

export function getRootHostname(urlObj: string | urlModule.UrlWithStringQuery, stripSubdomains = false) {
    return url.getRootHostname(urlObj, stripSubdomains)
}

export function getRootHost(urlObj: string | urlModule.UrlWithStringQuery, stripSubdomains = false) {
    return url.getRootHost(urlObj, stripSubdomains)
}

export function formatUrl(urlObj: urlModule.UrlWithStringQuery, removeFragment = true) {
    return url.formatUrl(urlObj, removeFragment)
}

export function cloneObject(object: any) {
    return JSON.parse(JSON.stringify(object))
}

export function uniqueArrayValues<T>(arr: T[]): T[] {
    return Array.from<T>(new Set<T>(arr))
}

export function getUniqueUrls(arr: string[]): string[] {
    let protocolFilter = (url) => { // filter duplicates with http and https
        return url.replace(/^https?:\/\//i, '')
    }
    let objArr = arr.map((x) => {return {url: x}}) // doesn't work inline
    let uniqueArr = objects.getUniqueResults(objArr, 'url', protocolFilter)
    return uniqueArr.map(x => x.url)
}

/**
 * Test if a phrase is present in a string
 * @param result {string/array} the string or array of strings to search in
 * @param keyword {string} the phrase to search for
 * @param options {string} RegExp options such as "i"
 * @return {bool}
 */
export function matchPhrase(result: string | string[], keyword: string, options = '') {
    let resultArr = typeof result === 'string' ? [result] : result
    keyword = keyword.split(new RegExp(conf.WORD_SEPARATOR_REGEX)).join(conf.WORD_SEPARATOR_REGEX)
    keyword = text.escapeRegex(keyword)
    let phraseRegex = new RegExp(keyword, options)
    for (let i = 0; i < resultArr.length; i++) {
        if (resultArr[i] == '' || typeof resultArr[i] !== 'string')
            continue // some search backends return false or null
        if (phraseRegex.test(resultArr[i]) === true) {
            return true
        }
    }
    return false
}

/**
 * Check if all words from keyword are present in the result strings
 * @param result {string/array} the string or array of strings to search in
 * @param keyword {string} the phrase to search for
 * @param options {string} RegExp options such as "i"
 * @param inOrder {bool} if the keywords have to occur in the same order
 * @param ignoreKeywordRegex {string[]} A list of keywords to ignore (they will pass through as a successfull match)
 * @returns {boolean}
 */
export function matchBoolean(result: string | string[], keyword: string, options = '', inOrder = false, ignoreKeywordRegex: string[] = []) {
    let resultArr = typeof result === 'string' ? [result] : result
    let keywordArr = keyword.split(new RegExp(conf.WORD_SEPARATOR_REGEX))
    let isIgnoredKeyword = (curKeyword) => {
        for (let i = 0; i < ignoreKeywordRegex.length; i++)
        {
            if (curKeyword.match(new RegExp(ignoreKeywordRegex[i], "i")) !== null)
                return true;
        }
        return false;
    }

    for (let i = 0; i < resultArr.length; i++) {
        if (resultArr[i] == '' || typeof resultArr[i] !== 'string')
            continue // some search backends return false or null
        let foundAllKeywords = true
        for (let curKeyword of keywordArr) {
            if (curKeyword.length < 2 || isIgnoredKeyword(curKeyword))
                continue // difficult to match, might be a separator
            curKeyword = text.escapeRegex(curKeyword)
            let searchRegex = new RegExp(conf.WORD_SEPARATOR_BEGIN + curKeyword + conf.WORD_SEPARATOR_END, options)
            if (searchRegex.test(resultArr[i]) === false) {
                foundAllKeywords = false
                break // a keyword is missing, continue with next result string
            }
        }
        if (foundAllKeywords === true) {
            if (inOrder !== true)
                return true // we found all keywords in one of our result strings
            if (isAscendingWordOrder(resultArr[i], keywordArr, options) === true)
                return true
        }
    }
    return false
}

/**
 * Check if any of the supplied regex matches any of the result strings
 * @param result
 * @param regexStrings
 * @param options regex options, default "i"
 * @returns {boolean}
 */
export function matchRegex(result: string[], regexStrings: string[], options = "i") {
    for (let resultField of result)
    {
        if (!resultField)
            continue;
        for (let regex of regexStrings)
        {
            let testRegex = new RegExp(regex, options);
            if (testRegex.test(resultField) === true)
                return true;
        }
    }
    return false;
}

/**
 * Check if any of the tags are present in any of the result strings
 * @param result
 * @param tags
 * @returns {boolean}
 */
export function matchTag(result: string[], tags: string[]) {
    const options = "i";
    for (let resultField of result)
    {
        if (!resultField)
            continue;
        for (let tag of tags)
        {
            let curTag = text.escapeRegex(tag.replaceAll(" ", conf.WORD_SEPARATORS_SEARCH)) // match all space chars: "BD Rip", "BD-Rip",...
            let searchRegex = new RegExp(conf.WORD_SEPARATOR_BEGIN + curTag + conf.WORD_SEPARATOR_END, options)
            if (searchRegex.test(resultField) === true)
                return true;
        }
    }
    return false;
}

export function matchExcludeWord(result: string[], excludeWords: string, options = "i") {
    //let wordArr = excludeWords.split(" "); // or split by separator regex?
    let wordArr = excludeWords.split(new RegExp(conf.WORD_SEPARATORS_SEARCH));
    for (let excludeWord of wordArr)
    {
        if (!excludeWord)
            continue;
        for (let resultField of result)
        {
            if (!resultField)
                continue;
            if (containsWord(resultField, excludeWord, options))
                return true;
        }
    }
    return false;
}

export function getWordPositions(text: string, keywordArr: string[], options = '') {
    let pos = []
    for (let curKeyword of keywordArr) {
        //pos.push(text.indexOf(curKeyword)) // check by regex with word separators
        curKeyword = escapeRegex(curKeyword)
        let regex = new RegExp(conf.WORD_SEPARATOR_BEGIN + curKeyword + conf.WORD_SEPARATOR_END, options)
        let match = regex.exec(text)
        if (match !== null)
            pos.push(match.index) // will be the pos of the word separator, but ok
        else
            pos.push(-1) // shouldn't happen if we come from matchBoolean()
    }
    return pos
}

export function isAscendingWordOrder(text: string, keywordArr: string[], options = '') {
    let lastPos = -1
    // filter duplicate words (for example in "Bon Cop Bad Cop 2") // TODO improve to be able to check 2 different positions of the same word
    keywordArr = uniqueArrayValues<string>(keywordArr)
    let positions = getWordPositions(text, keywordArr, options)
    for (let pos of positions) {
        if (pos < lastPos)
            return false
        lastPos = pos
    }
    return true
}

export function containsWord(str: string, find: string, options = '') {
    find = escapeRegex(find)
    let searchRegex = new RegExp(conf.WORD_SEPARATOR_BEGIN + find + conf.WORD_SEPARATOR_END, options)
    return searchRegex.test(str) === true
}

export function getWordCount(text: string) {
    text = escapeRegex(text)
    let textParts = text.split(new RegExp(conf.WORD_SEPARATOR_REGEX))
    return textParts.length
}

export interface StringReplaceMap {
    [search: string]: string; // search -> replace
}
export function replaceStr(str: string, replaceMap: StringReplaceMap) {
    let replaceRegex = new RegExp(Object.keys(replaceMap).join("|"),"gi")
    str = str.replace(replaceRegex, (matched) => {
        return replaceMap[matched]
    })
    return str
}

export function escapeHtml(str: string) {
    return escapeHtmlMod(str)
}

/**
 * Replaces HTML chars such as &amp; with their Unicode representation.
 * @param str
 * @param trim default true
 */
export function decodeHtml(str: string, trim = true) {
    str = entities.decodeHTML(str);
    return trim === true ? str.trim() : str;
}

/**
 * promiseDelay returns a promise that gets resolved after the specified time
 */
export function promiseDelay<T>(delayMs: number, value: T = null) {
    return new Promise<T>((resolve, reject)=>{
        setTimeout(() => {
            resolve(value);
        }, delayMs);
    })
}

/**
 * promiseTimeout implements a timeout that will reject after ms millieseconds
 * if the given promise doesn't resolve before.
 */
export function promiseTimeout<T> (ms: number, promise: Promise<T>): Promise<T> {
    // Create a promise that rejects in <ms> milliseconds
    let timeout = new Promise<T>((resolve, reject) => {
        let id = setTimeout(() => {
            clearTimeout(id);
            reject('Timed out in '+ ms + 'ms.')
        }, ms)
    })

    // Returns a race between our timeout and the passed in promise
    return Promise.race<T>([
        promise,
        timeout
    ])
}


/**
 * Returns a logger object that can be used instead of console.log().
 * The object will log to our previously configured global app logger
 * @returns {{log: log}}
 */
export function getConsoleLogger() {
    return {
        log: function() {
            logger.info(arguments.toString())
        },
        debug: function() {
            logger.debug(arguments.toString())
        },
        info: function() {
            logger.info(arguments.toString())
        },
        error: function() {
            logger.error(arguments.toString())
        },
        warn: function() {
            logger.warn(arguments.toString())
        }
    }
}

export function restoreLogLines(dbLogDocs: any[]): string[] {
    let lines = [];
    dbLogDocs.forEach((doc) => {
        // 2017-12-18 09:11:44 - info: Updater: Uploaded bundle
        let line = getUnixTimeStr(true, doc.timestamp) + " - " + doc.level + ": " + doc.message;
        if (doc.meta && Object.keys(doc.meta).length !== 0)
            line += " " + JSON.stringify(doc.meta);
        lines.push(line)
    })
    return lines;
}

export function str2ab(str: string, togo: number = -1): ArrayBuffer {
    let buf = new ArrayBuffer(str.length); // 2 bytes for each char
    let bufView = new Uint8Array(buf);
    if (togo == -1 || togo > str.length)
        togo = str.length
    for (var i=0; i<togo; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

import * as file from "./file";
import * as test from "./test";
import * as constants from "./const"
import * as db from "./db";
import * as http from "./http";
import {SessionBrowser} from "./SessionBrowser";
import * as dispatcher from "@ekliptor/multihttpdispatcher";
import * as linkExtractor from "./linkExtractor";
import * as crypto from "./crypto";
import * as proc from "./process";
import * as calc from "./calc";
//import {add} from "nconf";
import * as winstonChildProc from "./src/winston-childproc";
//import * as winstonMongodb from "winston-mongodb";
import * as winstonMongodb from "./src/winston-mongodb/winston-mongodb";
import {RequestResponse} from "request";
import "./src/cache/FileHttpCache";

export {file, date, test, constants, db, http, SessionBrowser, dispatcher, linkExtractor, crypto, proc, calc, winstonGlobal, winstonChildProc, winstonMongodb,
    stripBom}
