"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exctractCustomLinks = exports.extractCrypterLinks = exports.extractHosterLinks = exports.extractAllLinks = exports.setFilteredUrlParts = exports.setKnownDomains = exports.setDecodeHtml = void 0;
var querystring = require("querystring");
var decodeHtmlLinks = false;
//const knownDomain = require(global.__legacyModules ? '../_db/_mongodb/models/knownDomain' : '../../models/knownDomain')
//const knownDomain = require('staydown-models').knownDomain
var knownDomain = null;
//const utils = global.__legacyModules ? require('strictutils')() : require('@ekliptor/apputils')
var utils = require("./utils");
//const nconf = utils.nconf;
var entities = require("entities");
var MAX_LINKS_PER_PAGE = 50000; // per page per type
var SKIP_EMPTY_URL_PATH = true; // don't crawl urls with path /
var filteredParts = ['/ref/', 'ref=', 'referrer',
    '/aff/', 'aff=', 'affiliate',
    'register', 'partner', 'signup',
    'forumstatus.php'];
var derefLink = function (urlObject, link) {
    for (var _i = 0, _a = knownDomain.DEREFERER; _i < _a.length; _i++) {
        var deref = _a[_i];
        if (urlObject.hostname !== deref || urlObject.query.length === 0)
            continue;
        if (typeof urlObject.query === "string") { // should always be string?
            link = utils.urlDecode(urlObject.query);
            break;
        }
        link = utils.urlDecode(querystring.stringify(urlObject.query));
        break;
    }
    var linkLower = link.toLowerCase();
    if (linkLower.indexOf('%2f') !== -1 || linkLower.indexOf('%3f') !== -1 || linkLower.indexOf('%20') !== -1) // / or ? or space
        link = utils.urlDecode(link);
    if (link.indexOf("?") === 0)
        link = link.substr(1);
    return link;
};
var isFilteredLink = function (link) {
    if (link.match(/favicon\.ico$/i) !== null)
        return true;
    var linkLower = link.toLowerCase();
    for (var i = 0; i < filteredParts.length; i++) {
        if (linkLower.indexOf(filteredParts[i]) !== -1)
            return true;
    }
    return false;
};
var isIgnoredLink = function (urlObj) {
    return knownDomain.IGNORE_LIST.has(urlObj.hostname);
};
var getLinkForMarker = function (html, htmlLower, domain, startTxt, filterSpamLinks, domainEnding) {
    if (filterSpamLinks === void 0) { filterSpamLinks = true; }
    if (domainEnding === void 0) { domainEnding = ""; }
    var links = [];
    var max = htmlLower.length;
    var start = 0;
    var shortStartText = startTxt.length <= 3;
    var linkProtocol = startTxt.indexOf('http') !== 0 && startTxt.indexOf(':') === -1 ? 'http://' : ''; // if startTxt is a protocol add nothing, otherwise assume http
    if (!domainEnding)
        domainEnding = domain.length !== 0 && domain.match(/\.[a-z0-9]+$/i) === null ? '.' : '';
    //let removeBackslash = startTxt.indexOf('\\') !== -1 // they get extracted with "www." marker too
    var count = 0;
    while ((start = htmlLower.indexOf(startTxt + domain + domainEnding, start)) !== -1) {
        count++;
        if (count > MAX_LINKS_PER_PAGE)
            break;
        var curStart = start; // cache it
        start += domain.length + startTxt.length + 1;
        var ends = [];
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
        ends = ends.map(function (end) {
            return end === -1 || end <= start ? max : end;
        });
        var end = ends.mathMin();
        var link = linkProtocol + html.substring(curStart, end); // get it from the original html (preserve upper/lowercase)
        //if (removeBackslash)
        if (link.indexOf('\\') !== -1)
            link = link.replace(/\\/g, '');
        // TODO re-add the full sub-domain such as www15.zippyhsare.com. but most hosters do a proper redirect to correct subdomain either way
        if (shortStartText === true && link.substr(0, startTxt.length) === startTxt)
            link = "http://" + link.substr(startTxt.length); // remove start such as "." or else URL parser will fail
        //link = entities.decodeHTML(link).replace(/ *\\r$/, '').trim() // doesn't always work. why?
        link = entities.decodeHTML(link).trim();
        start += domain.length + 1;
        var urlObj = utils.parseUrl(link);
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
var getExternalLinks = function (html, domain) {
    var links = [];
    if (decodeHtmlLinks === true)
        html = utils.decodeHtml(html, false);
    var htmlLower = html.toLocaleLowerCase();
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
    var requireSet = ["DEREFERER", "DOMAINS", "CRYPTERS", "IGNORE_LIST"];
    var requiredFun = ["isHoster", "isCrypter"];
    for (var _i = 0, requireSet_1 = requireSet; _i < requireSet_1.length; _i++) {
        var required = requireSet_1[_i];
        if (!knownDomainModule[required] || knownDomainModule[required] instanceof Set === false)
            throw new Error("Invalid knownDomainModule Module. The followng Arrays must be present: " + requireSet.toString());
    }
    for (var _a = 0, requiredFun_1 = requiredFun; _a < requiredFun_1.length; _a++) {
        var required = requiredFun_1[_a];
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
function extractAllLinks(html, cb) {
    if (cb === void 0) { cb = null; }
    var links = getExternalLinks(html, "");
    links = utils.getUniqueUrls(links);
    cb && cb(null, links);
}
exports.extractAllLinks = extractAllLinks;
function extractHosterLinks(html, decrypt, cb) {
    if (decrypt === void 0) { decrypt = false; }
    if (cb === void 0) { cb = null; }
    // TODO if decrypt is set to true:
    // 1. search also for domain names without extension
    // 2. open those links and check if we find and decrypt a known hoster domain
    if (decrypt === true)
        throw "extractHosterLinks() with decrypt option is not yet implemented";
    var links = [];
    knownDomain.DOMAINS.forEach(function (domain) {
        if (knownDomain.isHoster(domain))
            links = links.concat(getExternalLinks(html, domain));
    });
    knownDomain.DEREFERER.forEach(function (domain) {
        links = links.concat(getExternalLinks(html, domain).filter(function (l) { return knownDomain.isHoster(utils.getRootHostname(l)); }));
    });
    //links = utils.uniqueArrayValues(links)
    links = utils.getUniqueUrls(links);
    cb && cb(null, links);
}
exports.extractHosterLinks = extractHosterLinks;
function extractCrypterLinks(html, decrypt, cb) {
    if (decrypt === void 0) { decrypt = false; }
    if (cb === void 0) { cb = null; }
    if (decrypt === true)
        throw "extractCrypterLinks() with decrypt option is not yet implemented";
    var links = [];
    knownDomain.CRYPTERS.forEach(function (domain) {
        links = links.concat(getExternalLinks(html, domain));
    });
    knownDomain.DEREFERER.forEach(function (domain) {
        links = links.concat(getExternalLinks(html, domain).filter(function (l) { return knownDomain.isCrypter(utils.getRootHostname(l)); }));
    });
    links = utils.getUniqueUrls(links);
    // TODO decrypt async in here with new function extractor.decryptLinks()
    cb && cb(null, links);
}
exports.extractCrypterLinks = extractCrypterLinks;
function exctractCustomLinks(html, protocol, domain, cb) {
    if (protocol === void 0) { protocol = 'http'; }
    if (domain === void 0) { domain = ''; }
    if (cb === void 0) { cb = null; }
    var htmlLower = html.toLocaleLowerCase();
    if (htmlLower.length !== html.length)
        html = htmlLower; // should never happen
    if (protocol.substr(-3) !== '://' && protocol.substr(0, 7) !== 'magnet:') // can be ed2k:// or magnet:?xt=urn:btih:
        protocol += '://';
    var links = getLinkForMarker(html, htmlLower, domain, protocol, false);
    links = utils.getUniqueUrls(links);
    cb && cb(null, links);
}
exports.exctractCustomLinks = exctractCustomLinks;
