"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAvailbleIP = exports.listAvailableIPs = exports.createCookie = void 0;
const os = require("os");
const utils = require("./utils");
function createCookie(key, value, url, expiresMin = 365 * 24 * 60) {
    let urlObj = utils.parseUrl(url);
    let cookie = /*new tough.Cookie(*/ {
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
    let ifaces = os.networkInterfaces();
    let ips = [];
    for (let name in ifaces) {
        let dataArr = ifaces[name];
        dataArr.forEach((data) => {
            if (data.address)
                ips.push(data.address);
        });
    }
    return ips;
}
exports.listAvailableIPs = listAvailableIPs;
function isAvailbleIP(ip) {
    let ips = listAvailableIPs();
    return ips.indexOf(ip) !== -1;
}
exports.isAvailbleIP = isAvailbleIP;
//# sourceMappingURL=http.js.map