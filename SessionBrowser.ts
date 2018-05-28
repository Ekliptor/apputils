import utils = require('./utils.js')

export class SessionBrowser {
    protected options: any;

    constructor(options = {}) {
        this.options = options
    }

    getPageCode(address, callback, options = null) {
        return utils.getPageCode(address, callback, options === null ? this.options : options)
    }

    postData(address, data, callback, options = null) {
        return utils.postData(address, data, callback, options === null ? this.options : options)
    }

    postDataAsJson(address, obj, callback, options = null) {
        return utils.postDataAsJson(address, obj, callback, options === null ? this.options : options)
    }

    getOptions() {
        return this.options
    }

    getCookies(url) {
        return this.options.cookieJar.getCookies(url)
    }
}

module.exports = SessionBrowser