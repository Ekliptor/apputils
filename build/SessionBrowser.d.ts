/// <reference types="request" />
export declare class SessionBrowser {
    protected options: any;
    constructor(options?: {});
    getPageCode(address: any, callback: any, options?: any): import("request").Request;
    postData(address: any, data: any, callback: any, options?: any): import("request").Request;
    postDataAsJson(address: any, obj: any, callback: any, options?: any): false | import("request").Request;
    getOptions(): any;
    getCookies(url: any): any;
}
