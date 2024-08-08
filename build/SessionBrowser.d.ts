export declare class SessionBrowser {
    protected options: any;
    constructor(options?: {});
    getPageCode(address: any, callback: any, options?: any): any;
    postData(address: any, data: any, callback: any, options?: any): any;
    postDataAsJson(address: any, obj: any, callback: any, options?: any): any;
    getOptions(): any;
    getCookies(url: any): any;
}
