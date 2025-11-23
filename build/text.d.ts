import * as urlModule from "url";
export interface GetBetweenOptions {
    startPos?: number;
    prestartTxt?: string;
    caseInsensitive?: boolean;
}
export interface TranslationFunction {
    (key: string): string;
}
export declare function getBetween(text: string, startTxt: string, endTxt: string, options?: GetBetweenOptions): string | false;
export declare function regexIndexOf(str: string, regex: RegExp, startpos?: number): number;
export declare function formatNumber(number: string | number, commaDigits: number, decimalSep: string, thousandSep: string): string;
export declare function formatCurrency(amount: string | number, tr: TranslationFunction): string;
export declare function formatBtc(amount: string | number, tr: TranslationFunction): string;
export declare function getDisplaySize(sizeBytes: number, tr?: TranslationFunction): string;
export declare function escapeRegex(str: string): string;
/**
 * Highlight a string-result of a keyword search to show it in the browser
 * @param str the already html-escaped string
 * @param keyword the keyword (not html-escaped)
 * @return string
 */
export declare function getHighlightedString(str: string, keyword: string): string;
export declare function truncateWords(text: string, length: number): string;
/**
 * Get's the position of the last word separator going backwards from beginIndex.
 * Index can be used as the first or second argument of substr() to cut a text by word separators.
 * @param text {String}
 * @position beginIndex {int}
 * @return {int} The position of the last word separator, or 0 if no separator was found
 */
export declare function getLastWordPosBackwards(text: string, beginIndex: number): number;
export declare function getOrdinal(n: number): string;
export declare function fixUrl(url: string, hostBase: urlModule.Url | string): string;
/**
 * Populate a html template
 * @param text {String}: The html template (or just normal text with variables)
 * @param tr {Function} the tranlsation function
 * @param variables {Object}: the key-value pairs with variables names and their content to be set in text
 * @param safeHtml {boolean, default false}: don't escape html characters if set to true
 * @returns {String} the translated html
 */
export declare function translate(text: string, tr: TranslationFunction, variables: any, safeHtml: boolean): string;
export declare function getMetaContentType(html: string, rawValue?: boolean): string | false;
export declare function splitLines(textStr: string): string[];
export declare function replaceLineBreaks(str: string): string;
/**
 * Makes sure line breaks in str are displayed correctly on windows and UNIX systems. Useful if you want to
 * send str as a plain text email.
 * @param {string} str
 * @returns {string}
 */
export declare function ensureMultiPlatformLineBreaks(str: string): string;
/**
 * Adds <br> tags to all line breaks in the string.
 * @param {string} str
 * @param {boolean} escape Whether to escape existing HTML code to make them safe for printing. Default true.
 * @returns {string}
 */
export declare function addHtmlLineBreaks(str: string, escape?: boolean): string;
export declare function isHtml(str: string): boolean;
/**
 * Returns a base64 gzipped string of the input
 * @param {Buffer | string} input
 * @returns {Promise<string>}
 */
export declare function packGzip(input: Buffer | string): Promise<string>;
/**
 * Returns an utf8 unzipped string of the input
 * @param {Buffer | string} input
 * @returns {Promise<string>}
 */
export declare function unpackGzip(input: Buffer | string): Promise<string>;
/**
 * A fast way to check if we should try to parse a string as json
 * @param {string} str
 * @returns {boolean}
 */
export declare function isPossibleJson(str: string): boolean;
export declare function substrCount(str: string, find: string): number;
