export interface TailCallback {
    (error: any, lines?: string[]): void;
}
/**
 * Read the last lines of the given file.
 * @param fileName
 * @param lineCount
 * @param cb
 */
export declare function tail(fileName: string, lineCount: number, cb: TailCallback): void;
/**
 * Read the last lines of the given file.
 * @param fileName
 * @param lineCount
 */
export declare function tailPromise(fileName: string, lineCount: number): Promise<string[]>;
