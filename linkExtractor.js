"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exctractCustomLinks = exports.extractCrypterLinks = exports.extractHosterLinks = exports.extractAllLinks = exports.setFilteredUrlParts = exports.setKnownDomains = exports.setDecodeHtml = void 0;
const querystring = require("querystring");
let decodeHtmlLinks = false;
//const knownDomain = require(global.__legacyModules ? '../_db/_mongodb/models/knownDomain' : '../../models/knownDomain')
//const knownDomain = require('staydown-models').knownDomain
let knownDomain = null;
//const utils = global.__legacyModules ? require('strictutils')() : require('@ekliptor/apputils')
const utils = require("./utils");
//const nconf = utils.nconf;
const entities = require("entities");
const MAX_LINKS_PER_PAGE = 50000; // per page per type
const SKIP_EMPTY_URL_PATH = true; // don't crawl urls with path /
let filteredParts = ['/ref/', 'ref=', 'referrer',
    '/aff/', 'aff=', 'affiliate',
    'register', 'partner', 'signup',
    'forumstatus.php'];
let derefLink = (urlObject, link) => {
    for (let deref of knownDomain.DEREFERER) {
        if (urlObject.hostname !== deref || urlObject.query.length === 0)
            continue;
        if (typeof urlObject.query === "string") { // should always be string?
            link = utils.urlDecode(urlObject.query);
            break;
        }
        link = utils.urlDecode(querystring.stringify(urlObject.query));
        break;
    }
    let linkLower = link.toLowerCase();
    if (linkLower.indexOf('%2f') !== -1 || linkLower.indexOf('%3f') !== -1 || linkLower.indexOf('%20') !== -1) // / or ? or space
        link = utils.urlDecode(link);
    if (link.indexOf("?") === 0)
        link = link.substr(1);
    return link;
};
let isFilteredLink = (link) => {
    if (link.match(/favicon\.ico$/i) !== null)
        return true;
    let linkLower = link.toLowerCase();
    for (let i = 0; i < filteredParts.length; i++) {
        if (linkLower.indexOf(filteredParts[i]) !== -1)
            return true;
    }
    return false;
};
let isIgnoredLink = (urlObj) => {
    return knownDomain.IGNORE_LIST.has(urlObj.hostname);
};
let getLinkForMarker = (html, htmlLower, domain, startTxt, filterSpamLinks = true, domainEnding = "") => {
    let links = [];
    let max = htmlLower.length;
    let start = 0;
    const shortStartText = startTxt.length <= 3;
    let linkProtocol = startTxt.indexOf('http') !== 0 && startTxt.indexOf(':') === -1 ? 'http://' : ''; // if startTxt is a protocol add nothing, otherwise assume http
    if (!domainEnding)
        domainEnding = domain.length !== 0 && domain.match(/\.[a-z0-9]+$/i) === null ? '.' : '';
    //let removeBackslash = startTxt.indexOf('\\') !== -1 // they get extracted with "www." marker too
    let count = 0;
    while ((start = htmlLower.indexOf(startTxt + domain + domainEnding, start)) !== -1) {
        count++;
        if (count > MAX_LINKS_PER_PAGE)
            break;
        let curStart = start; // cache it
        start += domain.length + startTxt.length + 1;
        let ends = [];
        ends.push(htmlLower.indexOf("\n", start)); // real line ending
        ends.push(htmlLower.indexOf("\\n", start)); // escaped line ending in javascript strings with links
        ends.push(htmlLower.indexOf("\r", start)); // repeat the same for windows
        ends.push(htmlLower.indexOf("\\r", start));
        ends.push(htmlLower.indexOf("<", start));
        ends.push(htmlLower.indexOf(">", start)); // value=https://www.oboom.com/IS3JZCPX/asex.wmv> is valid html (without quotes)
        ends.push(htmlLower.indexOf(" ", start));
        ends.push(htmlLower.indexOf('"', start)); // TODO http://www.pornmade.com/riley-reid-in-riley-really-has-fun-twistys/ html attributes without quotes are valid!
        ends.push(htmlLower.indexOf("'", start));
        ends.push(htmlLower.indexOf("[/", start)); // the end of BB tags
        ends = ends.map((end) => {
            return end === -1 || end <= start ? max : end;
        });
        let end = ends.mathMin();
        let link = linkProtocol + html.substring(curStart, end); // get it from the original html (preserve upper/lowercase)
        //if (removeBackslash)
        if (link.indexOf('\\') !== -1)
            link = link.replace(/\\/g, '');
        // TODO re-add the full sub-domain such as www15.zippyhsare.com. but most hosters do a proper redirect to correct subdomain either way
        if (shortStartText === true && link.substr(0, startTxt.length) === startTxt)
            link = "http://" + link.substr(startTxt.length); // remove start such as "." or else URL parser will fail
        //link = entities.decodeHTML(link).replace(/ *\\r$/, '').trim() // doesn't always work. why?
        link = entities.decodeHTML(link).trim();
        start += domain.length + 1;
        let urlObj = utils.parseUrl(link);
        if (!urlObj || !urlObj.host)
            continue;
        else if (SKIP_EMPTY_URL_PATH && (!urlObj.pathname || urlObj.pathname === "/") && !urlObj.query)
            continue;
        // deref is often not called because the url dereferer is not part of our known domains, i.e. startPos is in the query string already
        link = derefLink(urlObj, link);
        if (!link) // check again
            continue;
        if (filterSpamLinks === true && isFilteredLink(link))
            continue;
        else if (isIgnoredLink(urlObj))
            continue;
        links.push(link);
    }
    return links;
};
let getExternalLinks = (html, domain) => {
    let links = [];
    if (decodeHtmlLinks === true)
        html = utils.decodeHtml(html, false);
    let htmlLower = html.toLocaleLowerCase();
    if (htmlLower.length !== html.length)
        html = htmlLower; // should never happen
    links = links.concat(getLinkForMarker(html, htmlLower, domain, 'http://'));
    links = links.concat(getLinkForMarker(html, htmlLower, domain, 'https://'));
    links = links.concat(getLinkForMarker(html, htmlLower, domain, 'http:\\/\\/'));
    links = links.concat(getLinkForMarker(html, htmlLower, domain, 'https:\\/\\/'));
    links = links.concat(getLinkForMarker(html, htmlLower, domain, 'www.'));
    links = links.concat(getLinkForMarker(html, htmlLower, domain, '.', true, "/")); // find www15.zippyshare.com/
    return links;
};
/**
 * Enables decoding of HTML strings for LinkExtractor to find links such as href='&#x68;&#x74;...'
 * @param decode
 */
function setDecodeHtml(decode) {
    decodeHtmlLinks = decode;
}
exports.setDecodeHtml = setDecodeHtml;
function setKnownDomains(knownDomainModule) {
    const requireSet = ["DEREFERER", "DOMAINS", "CRYPTERS", "IGNORE_LIST"];
    const requiredFun = ["isHoster", "isCrypter"];
    for (let required of requireSet) {
        if (!knownDomainModule[required] || knownDomainModule[required] instanceof Set === false)
            throw new Error("Invalid knownDomainModule Module. The followng Arrays must be present: " + requireSet.toString());
    }
    for (let required of requiredFun) {
        if (typeof knownDomainModule[required] !== "function")
            throw new Error("Invalid knownDomainModule Module. The followng functions properties must be present: " + requiredFun.toString());
    }
    knownDomain = knownDomainModule;
}
exports.setKnownDomains = setKnownDomains;
function setFilteredUrlParts(filteredArr) {
    filteredParts = filteredArr;
}
exports.setFilteredUrlParts = setFilteredUrlParts;
function extractAllLinks(html, cb = null) {
    let links = getExternalLinks(html, "");
    links = utils.getUniqueUrls(links);
    cb && cb(null, links);
}
exports.extractAllLinks = extractAllLinks;
function extractHosterLinks(html, decrypt = false, cb = null) {
    // TODO if decrypt is set to true:
    // 1. search also for domain names without extension
    // 2. open those links and check if we find and decrypt a known hoster domain
    if (decrypt === true)
        throw "extractHosterLinks() with decrypt option is not yet implemented";
    let links = [];
    knownDomain.DOMAINS.forEach((domain) => {
        if (knownDomain.isHoster(domain))
            links = links.concat(getExternalLinks(html, domain));
    });
    knownDomain.DEREFERER.forEach((domain) => {
        links = links.concat(getExternalLinks(html, domain).filter(l => knownDomain.isHoster(utils.getRootHostname(l))));
    });
    //links = utils.uniqueArrayValues(links)
    links = utils.getUniqueUrls(links);
    cb && cb(null, links);
}
exports.extractHosterLinks = extractHosterLinks;
function extractCrypterLinks(html, decrypt = false, cb = null) {
    if (decrypt === true)
        throw "extractCrypterLinks() with decrypt option is not yet implemented";
    let links = [];
    knownDomain.CRYPTERS.forEach((domain) => {
        links = links.concat(getExternalLinks(html, domain));
    });
    knownDomain.DEREFERER.forEach((domain) => {
        links = links.concat(getExternalLinks(html, domain).filter(l => knownDomain.isCrypter(utils.getRootHostname(l))));
    });
    links = utils.getUniqueUrls(links);
    // TODO decrypt async in here with new function extractor.decryptLinks()
    cb && cb(null, links);
}
exports.extractCrypterLinks = extractCrypterLinks;
function exctractCustomLinks(html, protocol = 'http', domain = '', cb = null) {
    let htmlLower = html.toLocaleLowerCase();
    if (htmlLower.length !== html.length)
        html = htmlLower; // should never happen
    if (protocol.substr(-3) !== '://' && protocol.substr(0, 7) !== 'magnet:') // can be ed2k:// or magnet:?xt=urn:btih:
        protocol += '://';
    let links = getLinkForMarker(html, htmlLower, domain, protocol, false);
    links = utils.getUniqueUrls(links);
    cb && cb(null, links);
}
exports.exctractCustomLinks = exctractCustomLinks;
//# sourceMappingURL=linkExtractor.js.map