"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// from https://github.com/codemanki/cloudscraper
// TODO add support for blazingfast.io protection page
var vm = require('vm');
var requestModule = require('request');
var jar = requestModule.jar();
const url = require('url');
//Ekliptor> more useragents
var userAgents = ['Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.87 Safari/537.36',
    'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.94 Safari/537.36',
    'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.87 Safari/537.36',
    'Mozilla/5.0 (Windows NT 6.0; rv:46.0) Gecko/20100101 Firefox/46.0',
    'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:46.0) Gecko/20100101 Firefox/46.0',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:46.0) Gecko/20100101 Firefox/46.0',
    'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:46.0) Gecko/20100101 Firefox/46.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_3) AppleWebKit/601.4.4 (KHTML, like Gecko) Version/9.0.3 Safari/601.4.4',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.12; rv:48.0) Gecko/20100101 Firefox/48.0'];
var requestM = requestModule.defaults({ jar: jar }), // Cookies should be enabled // we can still override this by passing our own cookie jar
UserAgent = userAgents[Math.floor(Math.random() * userAgents.length)], Timeout = 5200, // Cloudflare requires a delay of 5 seconds, so wait for at least 5.2
// part of options.solveCloudflareCaptcha on request function so that every solver instance is bound to a specific request
//solveCaptcha = null, // a custom function(options) to solve CF captcha. use phantomjs to reload url, solve it and give back the cookies
waitingHosts = new Map(), waitingHostTimeoutSec = 300; // 5min, remote captcha solving might take some time
/**
 * Performs get request to url with headers.
 * @param  {String}    url
 * @param  {Function}  callback    function(error, response, body) {}
 * @param  {Object}    headers     Hash with headers, e.g. {'Referer': 'http://google.com', 'User-Agent': '...'}
 */
function get(url, callback, headers) {
    return performRequest({
        method: 'GET',
        url: url,
        headers: headers
    }, callback);
}
exports.get = get;
;
/**
 * Performs post request to url with headers.
 * @param  {String}        url
 * @param  {String|Object} body        Will be passed as form data
 * @param  {Function}      callback    function(error, response, body) {}
 * @param  {Object}        headers     Hash with headers, e.g. {'Referer': 'http://google.com', 'User-Agent': '...'}
 */
function post(url, body, callback, headers) {
    var data = '', bodyType = Object.prototype.toString.call(body);
    if (bodyType === '[object String]') {
        data = body;
    }
    else if (bodyType === '[object Object]') {
        data = Object.keys(body).map(function (key) {
            return key + '=' + body[key];
        }).join('&');
    }
    headers = headers || {};
    headers['Content-Type'] = headers['Content-Type'] || 'application/x-www-form-urlencoded; charset=UTF-8';
    headers['Content-Length'] = headers['Content-Length'] || data.length;
    return performRequest({
        method: 'POST',
        body: data,
        url: url,
        headers: headers
    }, callback);
}
exports.post = post;
/**
 * Performs get or post request with generic request options
 * @param {Object}   options   Object to be passed to request's options argument
 * @param {Function} callback  function(error, response, body) {}
 */
function request(options, callback) {
    return performRequest(options, callback);
}
exports.request = request;
function performRequest(options, callback) {
    let method;
    options = options || {};
    options.headers = options.headers || {};
    // ensure we send proper browser headers (needed for "under attack mode")
    if (!options.headers['Accept'])
        options.headers['Accept'] = 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8';
    if (!options.headers['Accept-Language'])
        options.headers['Accept-Language'] = 'en-US,en;q=0.5';
    if (!options.headers['Accept-Encoding'])
        options.headers['Accept-Encoding'] = 'gzip, deflate';
    var makeRequest = requestMethod(options.method);
    //Can't just do the normal options.encoding || 'utf8'
    //because null is a valid encoding.
    if ('encoding' in options) {
        options.realEncoding = options.encoding;
    }
    else {
        options.realEncoding = 'utf8';
    }
    options.encoding = null;
    if (!options.url || !callback) {
        throw new Error('To perform request, define both url and callback');
    }
    let hostname = url.parse(options.url).host;
    if (isWaitingHost(hostname)) {
        return addPendingRequest(hostname, options, callback); // here we return undefined instead of the request object! // TODO better idea?
    }
    options.headers['User-Agent'] = options.headers['User-Agent'] || UserAgent;
    return makeRequest(options, function (error, response, body) {
        var validationError;
        var stringBody;
        if (error || !body || !body.toString) {
            return callback({ errorType: 0, error: error }, body, response);
        }
        stringBody = body.toString('utf8');
        // wait page has http code 503
        if (validationError = checkForErrors(error, stringBody)) {
            if (validationError.errorType === 1 && typeof options.solveCloudflareCaptcha === "function") {
                addWaitingHost(response.request.uri.host);
                options.cloudflareHtml = stringBody;
                options.solveCloudflareCaptcha(options, (err, html) => {
                    // TODO we currently pass back the wrong response object. but the phantomjs response is very different, so not compatible too?
                    if (err) {
                        //console.log('Error solving cloudflare captcha with phantomjs')
                        //console.log(err)
                        return callback({ errorType: 4, error: err }, html, response);
                    }
                    if (response.statusCode === 403)
                        response.statusCode = 200;
                    giveResults(options, error, response, html, callback); // we got past it!
                });
                return;
            }
            return callback(validationError, body, response);
        }
        // If body contains specified string, solve challenge
        if (stringBody.indexOf('a = document.getElementById(\'jschl-answer\');') !== -1) {
            addWaitingHost(response.request.uri.host);
            setTimeout(function () {
                return solveChallenge(response, stringBody, options, callback);
            }, Timeout);
        }
        else if (stringBody.indexOf('You are being redirected') !== -1 ||
            stringBody.indexOf('sucuri_cloudproxy_js') !== -1) {
            setCookieAndReload(response, stringBody, options, callback);
        }
        else {
            // All is good
            giveResults(options, error, response, body, callback);
        }
    });
}
function checkForErrors(error, body) {
    var match;
    // Pure request error (bad connection, wrong url, etc)
    if (error) {
        return { errorType: 0, error: error };
    }
    // Finding captcha
    if (body.indexOf('why_captcha') !== -1 || /cdn-cgi\/l\/chk_captcha/i.test(body)) {
        return { errorType: 1 };
    }
    // trying to find '<span class="cf-error-code">1006</span>'
    match = body.match(/<\w+\s+class="cf-error-code">(.*)<\/\w+>/i);
    if (match) {
        return { errorType: 2, error: parseInt(match[1]) };
    }
    return false;
}
function solveChallenge(response, body, options, callback) {
    var challenge = body.match(/name="jschl_vc" value="(\w+)"/), host = response.request.host, makeRequest = requestMethod(options.method), jsChlVc, answerResponse, answerUrl;
    if (!challenge) {
        return callback({ errorType: 3, error: 'I cant extract challengeId (jschl_vc) from page' }, body, response);
    }
    jsChlVc = challenge[1];
    challenge = body.match(/getElementById\('cf-content'\)[\s\S]+?setTimeout.+?\r?\n([\s\S]+?a\.value =.+?)\r?\n/i);
    if (!challenge) {
        return callback({ errorType: 3, error: 'I cant extract method from setTimeOut wrapper' }, body, response);
    }
    var challenge_pass = body.match(/name="pass" value="(.+?)"/)[1];
    challenge = challenge[1];
    challenge = challenge.replace(/a\.value =(.+?) \+ .+?;/i, '$1');
    challenge = challenge.replace(/\s{3,}[a-z](?: = |\.).+/g, '');
    challenge = challenge.replace(/'; \d+'/g, '');
    try {
        answerResponse = {
            'jschl_vc': jsChlVc,
            'pass': challenge_pass,
            'jschl_answer': (eval(challenge) + response.request.host.length)
        };
    }
    catch (err) {
        return callback({ errorType: 3, error: 'Error occurred during evaluation: ' + err.message }, body, response);
    }
    if (options.url) {
        let reqUrlObj = url.parse(options.url);
        answerUrl = reqUrlObj.protocol + '//' + reqUrlObj.host;
    }
    else
        answerUrl = response.request.uri.protocol + '//' + host;
    answerUrl += '/cdn-cgi/l/chk_jschl';
    // TODO currently fails with proxy in "under attack mode" see hdfilme.tv favicon. wrong header order?
    options.headers['Referer'] = response.request.uri.href; // Original url should be placed as referer
    options.url = answerUrl;
    options.qs = answerResponse;
    // Make request with answer
    makeRequest(options, function (error, response, body) {
        if (error) {
            return callback({ errorType: 0, error: error }, response, body);
        }
        if (response.statusCode === 302) {
            //by default, but for some reason it's not // can be enabled for all post requests or also completely disabled
            options.url = response.headers.location;
            delete options.qs;
            makeRequest(options, function (error, response, body) {
                giveResults(options, error, response, body, callback);
            });
        }
        else {
            giveResults(options, error, response, body, callback);
        }
    });
}
function setCookieAndReload(response, body, options, callback) {
    var challenge = body.match(/S='([^']+)'/);
    var makeRequest = requestMethod(options.method);
    if (!challenge) {
        return callback({ errorType: 3, error: 'I cant extract cookie generation code from page' }, body, response);
    }
    var base64EncodedCode = challenge[1];
    var cookieSettingCode = new Buffer(base64EncodedCode, 'base64').toString('ascii');
    var sandbox = {
        location: {
            reload: function () { }
        },
        document: {}
    };
    vm.runInNewContext(cookieSettingCode, sandbox);
    try {
        jar.setCookie(sandbox.document.cookie, response.request.uri.href, { ignoreError: true });
    }
    catch (err) {
        return callback({ errorType: 3, error: 'Error occurred during evaluation: ' + err.message }, body, response);
    }
    makeRequest(options, function (error, response, body) {
        if (error) {
            return callback({ errorType: 0, error: error }, response, body);
        }
        giveResults(options, error, response, body, callback);
    });
}
// Workaround for better testing. Request has pretty poor API
function requestMethod(method) {
    // For now only GET and POST are supported
    method = method.toUpperCase();
    return method === 'POST' ? requestM.post : requestM.get;
}
function giveResults(options, error, response, body, callback) {
    removeWaitingHost(response.request.uri.host, /*!error*/ true); // do it before callback to let new requets in callback immediately go through
    if (typeof options.realEncoding === 'string') {
        callback(error, response, body.toString(options.realEncoding));
    }
    else {
        callback(error, response, body);
    }
}
function isWaitingHost(host) {
    let waitingHost = waitingHosts.get(host);
    if (waitingHost === undefined)
        return false;
    let expires = new Date().getTime() - waitingHostTimeoutSec * 1000;
    if (waitingHost.started >= expires)
        return true;
    removeWaitingHost(host, false);
    return false;
}
function addWaitingHost(host) {
    if (waitingHosts.has(host))
        return; // keep the old timestamp, sholdn't happen
    waitingHosts.set(host, {
        started: new Date().getTime(),
        pending: []
    });
}
function addPendingRequest(host, options, callback) {
    let waitingHost = waitingHosts.get(host);
    waitingHost.pending.push({
        options: options,
        callback: callback
    });
}
function removeWaitingHost(host, success) {
    let waitingHost = waitingHosts.get(host);
    waitingHosts.delete(host);
    if (success === false || waitingHost === undefined) {
        if (waitingHost && success === false) {
            waitingHost.pending.forEach((pendingReq) => {
                if (typeof pendingReq.callback === 'function')
                    pendingReq.callback({ errorType: 0, error: 'failed to make previous request to bypass cloudflare' });
            });
        }
        return;
    }
    // we successfully made a request. make all other requests for this host
    // it is important that all those requests use the SAME cookie jar (or no cookie jar = the global jar)
    // otherwise they will have to solve the challenge again
    waitingHost.pending.forEach((pendingReq) => {
        performRequest(pendingReq.options, pendingReq.callback);
    });
}
//# sourceMappingURL=cloudscraper.js.map