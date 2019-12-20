export declare function createCookie(key: any, value: any, url: any, expiresMin?: number): {
    key: any;
    value: any;
    domain: string;
    path: string;
    httpOnly: boolean;
    secure: boolean;
    hostOnly: boolean;
    maxAge: string;
    creation: Date;
    creationIndex: number;
    extensions: any[];
    lastAccessed: Date;
    expires: Date;
    pathIsDefault: boolean;
};
export declare function listAvailableIPs(): string[];
export declare function isAvailbleIP(ip: string): boolean;
