/**
 * Enables decoding of HTML strings for LinkExtractor to find links such as href='&#x68;&#x74;...'
 * @param decode
 */
export declare function setDecodeHtml(decode: boolean): void;
export declare function setKnownDomains(knownDomainModule: any): void;
export declare function setFilteredUrlParts(filteredArr: any): void;
export declare function extractAllLinks(html: any, cb?: any): void;
export declare function extractHosterLinks(html: any, decrypt?: boolean, cb?: any): void;
export declare function extractCrypterLinks(html: any, decrypt?: boolean, cb?: any): void;
export declare function exctractCustomLinks(html: any, protocol?: string, domain?: string, cb?: any): void;
