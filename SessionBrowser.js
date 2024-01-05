"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionBrowser = void 0;
var utils = require("./utils.js");
var SessionBrowser = /** @class */ (function () {
    function SessionBrowser(options) {
        if (options === void 0) { options = {}; }
        this.options = options;
    }
    SessionBrowser.prototype.getPageCode = function (address, callback, options) {
        if (options === void 0) { options = null; }
        return utils.getPageCode(address, callback, options === null ? this.options : options);
    };
    SessionBrowser.prototype.postData = function (address, data, callback, options) {
        if (options === void 0) { options = null; }
        return utils.postData(address, data, callback, options === null ? this.options : options);
    };
    SessionBrowser.prototype.postDataAsJson = function (address, obj, callback, options) {
        if (options === void 0) { options = null; }
        return utils.postDataAsJson(address, obj, callback, options === null ? this.options : options);
    };
    SessionBrowser.prototype.getOptions = function () {
        return this.options;
    };
    SessionBrowser.prototype.getCookies = function (url) {
        return this.options.cookieJar.getCookies(url);
    };
    return SessionBrowser;
}());
exports.SessionBrowser = SessionBrowser;
module.exports = SessionBrowser;
