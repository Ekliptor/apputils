"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionBrowser = void 0;
const utils = require("./utils.js");
class SessionBrowser {
    constructor(options = {}) {
        this.options = options;
    }
    getPageCode(address, callback, options = null) {
        return utils.getPageCode(address, callback, options === null ? this.options : options);
    }
    postData(address, data, callback, options = null) {
        return utils.postData(address, data, callback, options === null ? this.options : options);
    }
    postDataAsJson(address, obj, callback, options = null) {
        return utils.postDataAsJson(address, obj, callback, options === null ? this.options : options);
    }
    getOptions() {
        return this.options;
    }
    getCookies(url) {
        return this.options.cookieJar.getCookies(url);
    }
}
exports.SessionBrowser = SessionBrowser;
module.exports = SessionBrowser;
//# sourceMappingURL=SessionBrowser.js.map