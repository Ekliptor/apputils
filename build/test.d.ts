export declare function readData(path: string, cb: (errOrData: any) => void): void;
export declare function createObject(base: any, extend: any): any;
export declare function getPassedTime(startMs: number, endMs?: number): string;
export declare function dumpError(err: any, logger?: any): string;
export declare function assertUnreachableCode(x: never): never;
