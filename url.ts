import utils = require('./utils')
import * as url from "url";
//import {UrlWithStringQuery} from "url";

export function parseUrl(linkStr: string) {
    if (linkStr.substr(0, 4) !== 'http')
        linkStr = 'http://' + linkStr
    return url.parse(linkStr) // returns protocol=hostname if we pass in a host
}

export function getRootHostname(urlObj: string | url.UrlWithStringQuery, stripSubdomains = false): string {
    if (typeof urlObj === "string")
        urlObj = parseUrl(urlObj);
    if (!urlObj)
        return "";
    if (stripSubdomains === true)
        return urlObj.hostname.replace(/^(.+\.)+([^\.]+\.[^\.]+)$/, '$2')
    return urlObj.hostname.replace(/^[a-z0-9\-]*\.(.+)\.(.+)$/i, '$1.$2')
}

export function getRootHost(urlObj: string | url.UrlWithStringQuery, stripSubdomains = false): string {
    if (typeof urlObj === "string")
        urlObj = parseUrl(urlObj);
    if (!urlObj)
        return "";
    if (stripSubdomains === true)
        return urlObj.host.replace(/^(.+\.)+([^\.]+\.[^\.]+)$/, '$2')
    return urlObj.host.replace(/^[a-z0-9\-]*\.(.+)\.(.+)$/i, '$1.$2')
}

export function formatUrl(urlObj: url.UrlWithStringQuery, removeFragment = true): string {
    let urlStr = url.format(urlObj)
    if (removeFragment === true) {
        let pos = urlStr.lastIndexOf("#")
        if (pos !== -1)
            urlStr = urlStr.substr(0, pos)
        pos = urlStr.lastIndexOf('.html,')
        if (pos !== -1)
            urlStr = urlStr.substr(0, pos+5)
        pos = urlStr.lastIndexOf('.htm,')
        if (pos !== -1)
            urlStr = urlStr.substr(0, pos+4)
    }
    return urlStr
}

export function addParamToUrl(urlStr: string, key, value = '1', overwrite = false): string {
    let start = urlStr.indexOf('?')
    if (start !== -1 && urlStr.indexOf(key + '=') !== -1) {
        if (!overwrite)
            return urlStr // param already exists
        let search = utils.escapeRegex(key + '=')
        urlStr = urlStr.replace(new RegExp(search + '[^&]*(&|$)'), '') // remove it and add it to the end of the url
        urlStr = urlStr.replace(/(\?|&)$/, '')
    }
    let queryParam = urlStr.indexOf('?') !== -1 ? '&' : '?'
    return urlStr + queryParam + key + '=' + value
}

/* part of urlUtils.parseUrl() except for # params (which are only present on url.hash as string and not sent on HTTP requests)
but a parameter map is missing in parseUrl(), see below
export function getUrlParameters(urlStr, decode = true) {
    $parameters = array();
    $start = strpos($url, '?');
    if ((DEBUG && strpos($url, 'gwt.codesvr=') !== false) || $start === false) {
        $start = strpos($url, '#!'); // if we pass an ajax url (not sent via HTTP!) we get our params from there
        if ($start === false) {
            $start = strpos($url, '#');
            if ($start === false)
                return $parameters;
            else
                $start += 1;
        }
        else
            $start += 2;
    }
    else
        $start += 1;
    $url = substr($url, $start);
    if (empty($url))
        return $parameters;
    if (($pos = strpos($url, '#')) !== false)
        $url = substr($url, 0, $pos); // don't search in both
    $fragments = explode('&', $url);
    foreach ($fragments as $fragment)
    {
        $parts = explode('=', $fragment, 2);
        if (count($parts) != 2)
            continue;
        $parameters[$parts[0]] = $decode ? urldecode($parts[1]) : $parts[1];
    }
    return $parameters;
}
*/

export function getUrlParameters(url: string, decode = false): any {
    decode = typeof decode === "boolean" && decode === true;
    let parameters = {};
    let start = url.indexOf("?");
    if (start === -1) {
        start = url.indexOf("#!");
        if (start === -1) {
            start = url.indexOf("#");
            if (start === -1)
                return parameters;
            else
                start += 1;
        }
        else
            start += 2;
    }
    else
        start += 1;
    url = url.substring(start);
    if (url.length === 0)
        return parameters;
    let pos = url.indexOf("#");
    if (pos !== -1)
        url = url.substring(0, pos); // don't search in both
    let fragments = url.split("&");
    for (let i = 0; i < fragments.length; i++)
    {
        let parts = fragments[i].split("=");
        if (parts.length !== 2)
            continue;
        parameters[parts[0]] = decode ? utils.urlDecode(parts[1]) : parts[1];
    }
    return parameters;
}

/**
 * Helper function to filter invalid JS strings when crawling
 * @param {string} urlStr
 * @returns {boolean}
 */
export function isValidLink(urlStr: string) {
    if (!urlStr)
        return false;
    return urlStr.length > 5 && urlStr.indexOf(".") !== -1; // urlStr != "null" && urlStr != "undefined"
}

export function isMediaLink(urlStr: string) {
    return urlStr.match(utils.conf.IMAGE_EXT_REGEX) !== null || urlStr.match(utils.conf.VIDEO_EXT_REGEX) !== null
}

export function isImageLink(urlStr: string) {
    return urlStr.match(utils.conf.IMAGE_EXT_REGEX) !== null
}

export function isVideoLink(urlStr: string) {
    return urlStr.match(utils.conf.VIDEO_EXT_REGEX) !== null
}

export function getRawHeaderObject(headerArr: string[]) {
    // response.rawHeaders:
    // ['Host',
    // '127.0.0.1:8000', ... ]
    let headers = {}
    for (let i = 0; i < headerArr.length-1; i += 2)
        headers[headerArr[i]] = headerArr[i+1]
    return headers
}

export function isValidDomain(domain: string) {
    let regex = new RegExp('^([a-z0-9\\-]+\\.)*[a-z0-9\\-]{2,}\\.[a-z]{2,6}$', 'i');
    return regex.test(domain);
}

/**
 * Returns a valid "Accept-Language" header. For example: en-US,en;q=0.5
 * @param {string} langOrLocale "en" or "en-GB",....
 * @returns {string}
 */
export function getLangReqHeader(langOrLocale: string): string {
    let langParts = langOrLocale.split("-");
    if (langParts.length === 1)
        return langParts[0].toLowerCase() + "-" + langParts[0].toUpperCase() + "," + langParts[0].toLowerCase() + ";q=0.5";
    return langParts[0].toLowerCase() + "-" + langParts[1].toUpperCase() + "," + langParts[0].toLowerCase() + ";q=0.5";
}