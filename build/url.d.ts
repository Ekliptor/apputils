/// <reference types="node" />
import * as url from "url";
export declare function parseUrl(linkStr: string): url.UrlWithStringQuery;
export declare function getRootHostname(urlObj: string | url.UrlWithStringQuery, stripSubdomains?: boolean): string;
export declare function getRootHost(urlObj: string | url.UrlWithStringQuery, stripSubdomains?: boolean): string;
export declare function formatUrl(urlObj: url.UrlWithStringQuery, removeFragment?: boolean): string;
export declare function addParamToUrl(urlStr: string, key: any, value?: string, overwrite?: boolean): string;
export declare function getUrlParameters(url: string, decode?: boolean): any;
/**
 * Helper function to filter invalid JS strings when crawling
 * @param {string} urlStr
 * @returns {boolean}
 */
export declare function isValidLink(urlStr: string): boolean;
export declare function isMediaLink(urlStr: string): boolean;
export declare function isImageLink(urlStr: string): boolean;
export declare function isVideoLink(urlStr: string, allowHtmlEnding?: boolean): boolean;
export declare function getRawHeaderObject(headerArr: string[]): {};
export declare function isValidDomain(domain: string): boolean;
/**
 * Returns a valid "Accept-Language" header. For example: en-US,en;q=0.5
 * @param {string} langOrLocale "en" or "en-GB",....
 * @returns {string}
 */
export declare function getLangReqHeader(langOrLocale: string): string;
export declare function getFileNameFromUrl(url: string): string;
