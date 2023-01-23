export declare function readData(path: string, cb: (errOrData: any) => void): void;
export declare function createObject<T>(base: any, extend: any): T;
export declare function getPassedTime(startMs: number, endMs?: number): string;
export declare function dumpError(err: any, logger?: any): string;
export declare function assertUnreachableCode(x: never): never;
