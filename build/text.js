"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBetween = getBetween;
exports.regexIndexOf = regexIndexOf;
exports.formatNumber = formatNumber;
exports.formatCurrency = formatCurrency;
exports.formatBtc = formatBtc;
exports.getDisplaySize = getDisplaySize;
exports.escapeRegex = escapeRegex;
exports.getHighlightedString = getHighlightedString;
exports.truncateWords = truncateWords;
exports.getLastWordPosBackwards = getLastWordPosBackwards;
exports.getOrdinal = getOrdinal;
exports.fixUrl = fixUrl;
exports.translate = translate;
exports.getMetaContentType = getMetaContentType;
exports.splitLines = splitLines;
exports.replaceLineBreaks = replaceLineBreaks;
exports.ensureMultiPlatformLineBreaks = ensureMultiPlatformLineBreaks;
exports.addHtmlLineBreaks = addHtmlLineBreaks;
exports.isHtml = isHtml;
exports.packGzip = packGzip;
exports.unpackGzip = unpackGzip;
exports.isPossibleJson = isPossibleJson;
exports.substrCount = substrCount;
//let logger = require('../../src/utils/Logger')
const utils = require("./utils.js");
let winston = utils.logger;
const conf = require("./conf");
const urlModule = require("url");
const zlib = require("zlib");
const gzip = zlib.createGzip();
function getBetween(text, startTxt, endTxt, options = {}) {
    options.startPos = typeof options.startPos === 'number' ? options.startPos : 0;
    let preStart = typeof options.prestartTxt === 'string' && options.prestartTxt !== '';
    let searchText = options.caseInsensitive === true ? text.toLocaleLowerCase() : text;
    if (options.caseInsensitive === true) {
        if (preStart)
            options.prestartTxt = options.prestartTxt.toLocaleLowerCase();
        startTxt = startTxt.toLocaleLowerCase();
        endTxt = endTxt.toLocaleLowerCase();
    }
    if (preStart) {
        options.startPos = searchText.indexOf(options.prestartTxt, options.startPos);
        if (options.startPos === -1)
            return false;
        options.startPos += options.prestartTxt.length;
    }
    options.startPos = searchText.indexOf(startTxt, options.startPos);
    if (options.startPos === -1)
        return false;
    options.startPos += startTxt.length;
    let endPos = searchText.indexOf(endTxt, options.startPos);
    if (endPos === -1)
        return false;
    return text.substr(options.startPos, endPos - options.startPos);
}
function regexIndexOf(str, regex, startpos) {
    let indexOf = str.substring(startpos || 0).search(regex);
    return (indexOf >= 0) ? (indexOf + (startpos || 0)) : indexOf;
}
function formatNumber(number, commaDigits, decimalSep, thousandSep) {
    var commaDigits = isNaN(commaDigits = Math.abs(commaDigits)) ? 2 : commaDigits, decimalSep = decimalSep == undefined ? "." : decimalSep, thousandSep = thousandSep == undefined ? "," : thousandSep, strOutput = number < 0 ? "-" : "", intNr = parseInt(number = Math.abs(+number || 0).toFixed(commaDigits)) + "", thousands = intNr.length > 3 ? intNr.length % 3 : 0;
    return strOutput + (thousands ? intNr.substr(0, thousands) + thousandSep : "") + intNr.substr(thousands).replace(/(\d{3})(?=\d)/g, "$1" + thousandSep) + (commaDigits ? decimalSep + Math.abs(number - intNr).toFixed(commaDigits).slice(2) : "");
}
function formatCurrency(amount, tr) {
    return formatNumber(amount, 2, tr("decPoint"), tr("thousandsSep"));
}
function formatBtc(amount, tr) {
    return formatNumber(amount, 8, tr("decPoint"), tr("thousandsSep"));
}
function getDisplaySize(sizeBytes, tr = null) {
    if (tr === null)
        tr = getTranslateSizeFunction();
    if (sizeBytes < 1024)
        return formatCurrency(sizeBytes, tr) + ' ' + tr('bytes');
    else if (sizeBytes < 1024 * 1024)
        return formatCurrency(sizeBytes / 1024, tr) + ' ' + tr('kb');
    else if (sizeBytes < 1024 * 1024 * 1024)
        return formatCurrency(sizeBytes / (1024 * 1024), tr) + ' ' + tr('mb');
    else if (sizeBytes < 1024 * 1024 * 1024 * 1024)
        return formatCurrency(sizeBytes / (1024 * 1024 * 1024), tr) + ' ' + tr('gb');
    else // if (sizeBytes < 1024*1024*1024*1024*1024)
        return formatCurrency(sizeBytes / (1024 * 1024 * 1024 * 1024), tr) + ' ' + tr('tb');
}
function getTranslateSizeFunction() {
    return (key) => {
        switch (key) {
            case "decPoint": return ".";
            case "thousandsSep": return ",";
            case "bytes": return "Bytes";
            default: return key.toUpperCase();
        }
    };
}
function escapeRegex(str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
}
/**
 * Highlight a string-result of a keyword search to show it in the browser
 * @param str the already html-escaped string
 * @param keyword the keyword (not html-escaped)
 * @return string
 */
function getHighlightedString(str, keyword) {
    let stringHighlighted = str.replaceAll("&#39;", "'"); // we have to HTML-escape the output before this function because of the <strong> tags below
    let keywords = keyword.split(/[ ]+/);
    for (let curKeyword of keywords) {
        let regString = '(^|' + conf.WORD_SEPARATORS_SEARCH + ')' + escapeRegex(curKeyword) + '($|' + conf.WORD_SEPARATORS_SEARCH + ')';
        let keywordExp = new RegExp(regString, 'i');
        let lastIndex = 0;
        let tempString = '';
        const maxReplaces = Math.floor(stringHighlighted.length / 3); // shouldn't happen, but be sure
        let count = 0;
        while (true) {
            let result = keywordExp.exec(stringHighlighted);
            if (result === null || ++count > maxReplaces)
                break;
            let replacement = result[0];
            let firstChar = '';
            let lastChar = '';
            if (replacement[0] && replacement[0].match(conf.WORD_SEPARATORS_SEARCH) !== null) {
                firstChar = replacement.substring(0, 1);
                replacement = replacement.substring(1);
            }
            let lastPos = replacement.length - 1;
            if (replacement[lastPos] && replacement[lastPos].match(conf.WORD_SEPARATORS_SEARCH) !== null) {
                lastChar = replacement.substring(lastPos);
                replacement = replacement.substring(0, lastPos);
            }
            if (replacement) // don't add b tag to empty strings
                replacement = firstChar + '<b>' + replacement + '</b>' + lastChar;
            else
                replacement = firstChar + replacement + lastChar;
            stringHighlighted = stringHighlighted.replace(keywordExp, replacement);
            lastIndex = result.index + replacement.length;
            tempString = tempString + stringHighlighted.substring(0, lastIndex);
            stringHighlighted = stringHighlighted.substring(lastIndex);
        }
        stringHighlighted = tempString + stringHighlighted;
    }
    return stringHighlighted.replaceAll("'", "&#39;");
}
function truncateWords(text, length) {
    length = Math.floor(length);
    if (text.length > length) {
        let textRegexp = new RegExp('^((\r\n|\n|.){1,' + length + '})(' + conf.WORD_SEPARATOR_REGEX + '(\r\n|\n|.)*|$)', '');
        text = text.replace(textRegexp, '$1...');
    }
    return text;
}
/**
 * Get's the position of the last word separator going backwards from beginIndex.
 * Index can be used as the first or second argument of substr() to cut a text by word separators.
 * @param text {String}
 * @position beginIndex {int}
 * @return {int} The position of the last word separator, or 0 if no separator was found
 */
function getLastWordPosBackwards(text, beginIndex) {
    if (beginIndex < 0)
        return 0;
    let searchTxt = text.substr(0, beginIndex);
    let separatorRegexp = new RegExp(conf.WORD_SEPARATOR_REGEX);
    let wordArr = searchTxt.split(separatorRegexp);
    wordArr = wordArr.splice(0, wordArr.length - 1); // return all except the last element
    if (wordArr.length === 0)
        return 0;
    let resultTxt = wordArr.join(' '); // assume all spaces, separator chars are only 1 char each
    return resultTxt.length + 1;
}
function getOrdinal(n) {
    // http://en.wikipedia.org/wiki/Ordinal_indicator#English
    let s = ["th", "st", "nd", "rd"], v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
function fixUrl(url, hostBase) {
    if (url.match("^https?://") !== null)
        return url;
    // use urlModule.resolve() for # and urls with ".."
    /*
    var baseUrl = "";
    if (typeof hostBase === "object") { // nodejs url object
        baseUrl = hostBase.protocol + "//" + hostBase.hostname;
        if (hostBase.port != null) {
            if ((hostBase.protocol === "http:" && hostBase.port != 80) || (hostBase.protocol === "https:" && hostBase.port != 443))
                baseUrl += ":" + hostBase.port;
        }
    }
    else
        baseUrl = hostBase

    if (url.substr(0, 2) == "//") { // url without protocol: //domain.com/foo
        var stop = baseUrl.indexOf("//");
        return baseUrl.substr(0, stop) + url
    }
    if (url[0] === "/")
        url = url.substring(1);

    if (baseUrl[baseUrl.length-1] !== "/")
        baseUrl += "/"; // append dir ending

    if (url[0] === "#")// for anchors we have to prepend the whole url
        return typeof hostBase === "object" ? hostBase.href + url : hostBase + url;
    return baseUrl + url;
    */
    let fromHref = typeof hostBase === "object" ? hostBase.href : hostBase;
    let urlStr = urlModule.resolve(fromHref, url);
    if (urlStr.indexOf("//") === 0) { // relative urls
        if (typeof hostBase === "object" && hostBase.protocol)
            urlStr = hostBase.protocol + urlStr;
        else
            urlStr = "http:" + urlStr;
    }
    return urlStr;
}
/**
 * Populate a html template
 * @param text {String}: The html template (or just normal text with variables)
 * @param tr {Function} the tranlsation function
 * @param variables {Object}: the key-value pairs with variables names and their content to be set in text
 * @param safeHtml {boolean, default false}: don't escape html characters if set to true
 * @returns {String} the translated html
 */
function translate(text, tr, variables, safeHtml) {
    if (typeof text !== "string") {
        try {
            // @ts-ignore
            text = text.toString();
        }
        catch (e) {
            winston.error("Text to translate is not a string");
            return text;
        }
    }
    var start = 0, end = 0;
    while ((start = text.indexOf("{", start)) !== -1) {
        if (start > 0 && text.charAt(start - 1) === "\\") { // escaped javascript code beginning
            start++;
            continue;
        }
        end = text.indexOf("}", start);
        if (end === -1) {
            winston.warn("Can not find end position while translating HTML");
            break;
        }
        var placeHolder = text.substring(start + 1, end);
        var translation = null;
        if (placeHolder.substring(0, 3) === "tr:") {
            var key = placeHolder.substring(3);
            //translation = this.tr(key.toUpperCase());
            translation = tr(key);
        }
        else if (typeof variables === "object") {
            var textPiece = variables[placeHolder];
            if (typeof textPiece !== "undefined") {
                if (typeof safeHtml === "boolean" && safeHtml)
                    translation = textPiece;
                else
                    translation = utils.escapeHtml(textPiece);
            }
        }
        if (translation !== null) {
            var reg = new RegExp("\\{" + placeHolder + "\\}", "g");
            text = text.replace(reg, translation);
        }
        else if (placeHolder.match("[A-Za-z0-9_]+") !== null) {
            winston.warn("No translation found for place holder: " + placeHolder);
            var reg = new RegExp("\\{" + placeHolder + "\\}", "g");
            text = text.replace(reg, "MISSING: " + utils.escapeHtml(placeHolder));
        }
        else
            start += placeHolder.length;
    }
    text = text.replace(/\\\\\\{/, "{");
    return text;
}
function getMetaContentType(html, rawValue = false) {
    const quotes = ['"', "'"];
    const tags = ['<meta charset={quote}', '<meta http-equiv={quote}Content-Type{quote} content={quote}']; // HTML5 and HTML4
    for (let tag of tags) {
        for (let quote of quotes) {
            let options = {
                startPos: 0,
                caseInsensitive: true
            };
            let search = tag.replaceAll("{quote}", quote);
            let metaCharset = utils.text.getBetween(html, search, quote, options);
            if (metaCharset === false)
                continue;
            // we found a charset
            if (rawValue)
                return metaCharset;
            let metaCharsetLower = metaCharset.toLowerCase();
            if (metaCharsetLower.indexOf("iso-") !== -1)
                return "iso";
            else if (metaCharsetLower.indexOf("utf") !== -1)
                return "utf8";
        }
    }
    return false;
}
function splitLines(textStr) {
    return textStr.split("\n").map(line => line.trim());
}
function replaceLineBreaks(str) {
    // replace all html line breaks that have other line breaks with them first
    str = str.replace(new RegExp("(\r\n|\n)<br>|<br>(\r\n|\n)", "ig"), "\n");
    str = str.replace(new RegExp("<br>", "ig"), "\n");
    return str;
}
/**
 * Makes sure line breaks in str are displayed correctly on windows and UNIX systems. Useful if you want to
 * send str as a plain text email.
 * @param {string} str
 * @returns {string}
 */
function ensureMultiPlatformLineBreaks(str) {
    return str.replace(/\r/g, "").replace(/\n/g, "\r\n");
}
/**
 * Adds <br> tags to all line breaks in the string.
 * @param {string} str
 * @param {boolean} escape Whether to escape existing HTML code to make them safe for printing. Default true.
 * @returns {string}
 */
function addHtmlLineBreaks(str, escape = true) {
    if (escape)
        str = utils.escapeHtml(str);
    return str.replace(/(\r\n|\n)/g, "$1<br>");
}
function isHtml(str) {
    if (!str)
        return false;
    let formatted = str.trim();
    if (formatted[0] === "<" && formatted.substr(-1) === ">")
        return true;
    // TODO more checks
    return false;
}
/**
 * Returns a base64 gzipped string of the input
 * @param {Buffer | string} input
 * @returns {Promise<string>}
 */
function packGzip(input) {
    return new Promise((resolve, reject) => {
        zlib.deflate(input, (err, buffer) => {
            if (err)
                return reject({ txt: "Error packing with gzip", err: err });
            resolve(buffer.toString('base64'));
        });
    });
}
/**
 * Returns an utf8 unzipped string of the input
 * @param {Buffer | string} input
 * @returns {Promise<string>}
 */
function unpackGzip(input) {
    return new Promise((resolve, reject) => {
        if (typeof input === "string")
            input = Buffer.from(input, 'base64');
        zlib.unzip(input, (err, buffer) => {
            if (err)
                return reject({ txt: "Error unpacking with gzip", err: err });
            resolve(buffer.toString("utf8"));
        });
    });
}
/**
 * A fast way to check if we should try to parse a string as json
 * @param {string} str
 * @returns {boolean}
 */
function isPossibleJson(str) {
    let strTemp = (str || "").trim();
    if (strTemp.length === 0)
        return false;
    return strTemp[0] === "{" || strTemp[0] === "[";
}
function substrCount(str, find) {
    let regex = escapeRegex(find);
    let count = (str.match(new RegExp(regex, 'g')) || []).length;
    return count;
}
//# sourceMappingURL=text.js.map