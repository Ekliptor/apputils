"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.substrCount = exports.isPossibleJson = exports.unpackGzip = exports.packGzip = exports.isHtml = exports.addHtmlLineBreaks = exports.ensureMultiPlatformLineBreaks = exports.replaceLineBreaks = exports.splitLines = exports.getMetaContentType = exports.translate = exports.fixUrl = exports.getOrdinal = exports.getLastWordPosBackwards = exports.truncateWords = exports.getHighlightedString = exports.escapeRegex = exports.getDisplaySize = exports.formatBtc = exports.formatCurrency = exports.formatNumber = exports.regexIndexOf = exports.getBetween = void 0;
//let logger = require('../../src/utils/Logger')
var utils = require("./utils.js");
var winston = utils.logger;
var conf = require("./conf");
var urlModule = require("url");
var zlib = require("zlib");
var gzip = zlib.createGzip();
function getBetween(text, startTxt, endTxt, options) {
    if (options === void 0) { options = {}; }
    options.startPos = typeof options.startPos === 'number' ? options.startPos : 0;
    var preStart = typeof options.prestartTxt === 'string' && options.prestartTxt !== '';
    var searchText = options.caseInsensitive === true ? text.toLocaleLowerCase() : text;
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
    var endPos = searchText.indexOf(endTxt, options.startPos);
    if (endPos === -1)
        return false;
    return text.substr(options.startPos, endPos - options.startPos);
}
exports.getBetween = getBetween;
function regexIndexOf(str, regex, startpos) {
    var indexOf = str.substring(startpos || 0).search(regex);
    return (indexOf >= 0) ? (indexOf + (startpos || 0)) : indexOf;
}
exports.regexIndexOf = regexIndexOf;
function formatNumber(number, commaDigits, decimalSep, thousandSep) {
    var commaDigits = isNaN(commaDigits = Math.abs(commaDigits)) ? 2 : commaDigits, decimalSep = decimalSep == undefined ? "." : decimalSep, thousandSep = thousandSep == undefined ? "," : thousandSep, strOutput = number < 0 ? "-" : "", intNr = parseInt(number = Math.abs(+number || 0).toFixed(commaDigits)) + "", thousands = intNr.length > 3 ? intNr.length % 3 : 0;
    return strOutput + (thousands ? intNr.substr(0, thousands) + thousandSep : "") + intNr.substr(thousands).replace(/(\d{3})(?=\d)/g, "$1" + thousandSep) + (commaDigits ? decimalSep + Math.abs(number - intNr).toFixed(commaDigits).slice(2) : "");
}
exports.formatNumber = formatNumber;
function formatCurrency(amount, tr) {
    return formatNumber(amount, 2, tr("decPoint"), tr("thousandsSep"));
}
exports.formatCurrency = formatCurrency;
function formatBtc(amount, tr) {
    return formatNumber(amount, 8, tr("decPoint"), tr("thousandsSep"));
}
exports.formatBtc = formatBtc;
function getDisplaySize(sizeBytes, tr) {
    if (tr === void 0) { tr = null; }
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
exports.getDisplaySize = getDisplaySize;
function getTranslateSizeFunction() {
    return function (key) {
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
exports.escapeRegex = escapeRegex;
/**
 * Highlight a string-result of a keyword search to show it in the browser
 * @param str the already html-escaped string
 * @param keyword the keyword (not html-escaped)
 * @return string
 */
function getHighlightedString(str, keyword) {
    var stringHighlighted = str.replaceAll("&#39;", "'"); // we have to HTML-escape the output before this function because of the <strong> tags below
    var keywords = keyword.split(/[ ]+/);
    for (var _i = 0, keywords_1 = keywords; _i < keywords_1.length; _i++) {
        var curKeyword = keywords_1[_i];
        var regString = '(^|' + conf.WORD_SEPARATORS_SEARCH + ')' + escapeRegex(curKeyword) + '($|' + conf.WORD_SEPARATORS_SEARCH + ')';
        var keywordExp = new RegExp(regString, 'i');
        var lastIndex = 0;
        var tempString = '';
        var maxReplaces = Math.floor(stringHighlighted.length / 3); // shouldn't happen, but be sure
        var count = 0;
        while (true) {
            var result = keywordExp.exec(stringHighlighted);
            if (result === null || ++count > maxReplaces)
                break;
            var replacement = result[0];
            var firstChar = '';
            var lastChar = '';
            if (replacement[0] && replacement[0].match(conf.WORD_SEPARATORS_SEARCH) !== null) {
                firstChar = replacement.substring(0, 1);
                replacement = replacement.substring(1);
            }
            var lastPos = replacement.length - 1;
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
exports.getHighlightedString = getHighlightedString;
function truncateWords(text, length) {
    length = Math.floor(length);
    if (text.length > length) {
        var textRegexp = new RegExp('^((\r\n|\n|.){1,' + length + '})(' + conf.WORD_SEPARATOR_REGEX + '(\r\n|\n|.)*|$)', '');
        text = text.replace(textRegexp, '$1...');
    }
    return text;
}
exports.truncateWords = truncateWords;
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
    var searchTxt = text.substr(0, beginIndex);
    var separatorRegexp = new RegExp(conf.WORD_SEPARATOR_REGEX);
    var wordArr = searchTxt.split(separatorRegexp);
    wordArr = wordArr.splice(0, wordArr.length - 1); // return all except the last element
    if (wordArr.length === 0)
        return 0;
    var resultTxt = wordArr.join(' '); // assume all spaces, separator chars are only 1 char each
    return resultTxt.length + 1;
}
exports.getLastWordPosBackwards = getLastWordPosBackwards;
function getOrdinal(n) {
    // http://en.wikipedia.org/wiki/Ordinal_indicator#English
    var s = ["th", "st", "nd", "rd"], v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
exports.getOrdinal = getOrdinal;
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
    var fromHref = typeof hostBase === "object" ? hostBase.href : hostBase;
    var urlStr = urlModule.resolve(fromHref, url);
    if (urlStr.indexOf("//") === 0) { // relative urls
        if (typeof hostBase === "object" && hostBase.protocol)
            urlStr = hostBase.protocol + urlStr;
        else
            urlStr = "http:" + urlStr;
    }
    return urlStr;
}
exports.fixUrl = fixUrl;
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
exports.translate = translate;
function getMetaContentType(html, rawValue) {
    if (rawValue === void 0) { rawValue = false; }
    var quotes = ['"', "'"];
    var tags = ['<meta charset={quote}', '<meta http-equiv={quote}Content-Type{quote} content={quote}']; // HTML5 and HTML4
    for (var _i = 0, tags_1 = tags; _i < tags_1.length; _i++) {
        var tag = tags_1[_i];
        for (var _a = 0, quotes_1 = quotes; _a < quotes_1.length; _a++) {
            var quote = quotes_1[_a];
            var options = {
                startPos: 0,
                caseInsensitive: true
            };
            var search = tag.replaceAll("{quote}", quote);
            var metaCharset = utils.text.getBetween(html, search, quote, options);
            if (metaCharset === false)
                continue;
            // we found a charset
            if (rawValue)
                return metaCharset;
            var metaCharsetLower = metaCharset.toLowerCase();
            if (metaCharsetLower.indexOf("iso-") !== -1)
                return "iso";
            else if (metaCharsetLower.indexOf("utf") !== -1)
                return "utf8";
        }
    }
    return false;
}
exports.getMetaContentType = getMetaContentType;
function splitLines(textStr) {
    return textStr.split("\n").map(function (line) { return line.trim(); });
}
exports.splitLines = splitLines;
function replaceLineBreaks(str) {
    // replace all html line breaks that have other line breaks with them first
    str = str.replace(new RegExp("(\r\n|\n)<br>|<br>(\r\n|\n)", "ig"), "\n");
    str = str.replace(new RegExp("<br>", "ig"), "\n");
    return str;
}
exports.replaceLineBreaks = replaceLineBreaks;
/**
 * Makes sure line breaks in str are displayed correctly on windows and UNIX systems. Useful if you want to
 * send str as a plain text email.
 * @param {string} str
 * @returns {string}
 */
function ensureMultiPlatformLineBreaks(str) {
    return str.replace(/\r/g, "").replace(/\n/g, "\r\n");
}
exports.ensureMultiPlatformLineBreaks = ensureMultiPlatformLineBreaks;
/**
 * Adds <br> tags to all line breaks in the string.
 * @param {string} str
 * @param {boolean} escape Whether to escape existing HTML code to make them safe for printing. Default true.
 * @returns {string}
 */
function addHtmlLineBreaks(str, escape) {
    if (escape === void 0) { escape = true; }
    if (escape)
        str = utils.escapeHtml(str);
    return str.replace(/(\r\n|\n)/g, "$1<br>");
}
exports.addHtmlLineBreaks = addHtmlLineBreaks;
function isHtml(str) {
    if (!str)
        return false;
    var formatted = str.trim();
    if (formatted[0] === "<" && formatted.substr(-1) === ">")
        return true;
    // TODO more checks
    return false;
}
exports.isHtml = isHtml;
/**
 * Returns a base64 gzipped string of the input
 * @param {Buffer | string} input
 * @returns {Promise<string>}
 */
function packGzip(input) {
    return new Promise(function (resolve, reject) {
        zlib.deflate(input, function (err, buffer) {
            if (err)
                return reject({ txt: "Error packing with gzip", err: err });
            resolve(buffer.toString('base64'));
        });
    });
}
exports.packGzip = packGzip;
/**
 * Returns an utf8 unzipped string of the input
 * @param {Buffer | string} input
 * @returns {Promise<string>}
 */
function unpackGzip(input) {
    return new Promise(function (resolve, reject) {
        if (typeof input === "string")
            input = Buffer.from(input, 'base64');
        zlib.unzip(input, function (err, buffer) {
            if (err)
                return reject({ txt: "Error unpacking with gzip", err: err });
            resolve(buffer.toString("utf8"));
        });
    });
}
exports.unpackGzip = unpackGzip;
/**
 * A fast way to check if we should try to parse a string as json
 * @param {string} str
 * @returns {boolean}
 */
function isPossibleJson(str) {
    var strTemp = (str || "").trim();
    if (strTemp.length === 0)
        return false;
    return strTemp[0] === "{" || strTemp[0] === "[";
}
exports.isPossibleJson = isPossibleJson;
function substrCount(str, find) {
    var regex = escapeRegex(find);
    var count = (str.match(new RegExp(regex, 'g')) || []).length;
    return count;
}
exports.substrCount = substrCount;
