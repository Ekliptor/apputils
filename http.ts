
import * as tough from "tough-cookie"; // dependency of request
import * as os from "os";
import utils = require('./utils');

export function createCookie(key, value, url, expiresMin = 365*24*60) {
    let urlObj = utils.parseUrl(url);
    let cookie = /*new tough.Cookie(*/{ // creates it directly from object (not string). weird API
        key:        key,
        value:      value,
        domain:     urlObj.hostname,
        path:       urlObj.path,
        httpOnly:   false,
        secure:     false,
        hostOnly:   true,
        maxAge:     'Infinity',
        creation:   new Date(),
        creationIndex: 0,
        extensions: [],
        lastAccessed: new Date(),
        expires:    new Date(Date.now() + expiresMin*60*1000),
        pathIsDefault: true
    }
    return cookie
}

export function listAvailableIPs(): string[] {
    let ifaces = os.networkInterfaces();
    let ips = [];
    for (let name in ifaces)
    {
        let dataArr = ifaces[name];
        dataArr.forEach((data) => {
            if (data.address)
                ips.push(data.address);
        });
    }
    return ips;
}

export function isAvailbleIP(ip: string): boolean {
    let ips = listAvailableIPs();
    return ips.indexOf(ip) !== -1;
}