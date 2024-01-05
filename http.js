"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAvailbleIP = exports.listAvailableIPs = exports.createCookie = void 0;
var os = require("os");
var utils = require("./utils");
function createCookie(key, value, url, expiresMin) {
    if (expiresMin === void 0) { expiresMin = 365 * 24 * 60; }
    var urlObj = utils.parseUrl(url);
    var cookie = /*new tough.Cookie(*/ {
        key: key,
        value: value,
        domain: urlObj.hostname,
        path: urlObj.path,
        httpOnly: false,
        secure: false,
        hostOnly: true,
        maxAge: 'Infinity',
        creation: new Date(),
        creationIndex: 0,
        extensions: [],
        lastAccessed: new Date(),
        expires: new Date(Date.now() + expiresMin * 60 * 1000),
        pathIsDefault: true
    };
    return cookie;
}
exports.createCookie = createCookie;
function listAvailableIPs() {
    var ifaces = os.networkInterfaces();
    var ips = [];
    for (var name_1 in ifaces) {
        var dataArr = ifaces[name_1];
        dataArr.forEach(function (data) {
            if (data.address)
                ips.push(data.address);
        });
    }
    return ips;
}
exports.listAvailableIPs = listAvailableIPs;
function isAvailbleIP(ip) {
    var ips = listAvailableIPs();
    return ips.indexOf(ip) !== -1;
}
exports.isAvailbleIP = isAvailbleIP;
