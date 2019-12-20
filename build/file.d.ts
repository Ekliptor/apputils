export declare function fileExists(location: string, orDirectory?: boolean): boolean;
export declare function getFolderSize(folderPath: string, callback: any): void;
/**
 * Get the size in bytes of a file (symbolic links followed).
 * If the file doesn't exist this function returns 0.
 * @param filePath
 */
export declare function getFileSize(filePath: string): Promise<number>;
/**
 * Delete a folder (or single file) with all its files recursively.
 * @param folderPath
 * @param callback(err)
 */
export declare function removeFolder(folderPath: string, callback: any): void;
/**
 * Recursively lists all files in a folder. Only files are returned. Folders do not get a separate entry.
 * Instead they are part of the relative path of the listed files.
 * The returned paths will be relative to folderPath
 * @param folderPath
 * @param callback
 * @param replacePath
 */
export declare function listDir(folderPath: string, callback: (err: any, dirFiles?: string[]) => void, replacePath?: RegExp): void;
export declare function getExistingFiles(filesArr: string[], callback: any): void;
export declare function getFileExtension(name: string, withDot?: boolean, defaultExt?: string): string;
/**
 * Used to get names from URL paths (and UNIX style paths)
 * @param path
 * @returns {*}
 */
export declare function getNameFromPath(path: string): string;
export declare function getDirFromPath(path: string): string;
/**
 * Copy a file from source to target.
 * @deprecated use the official fs.copyFile() instead
 * @param {string} source
 * @param {string} target
 * @returns {Promise<void>}
 */
export declare function copy(source: string, target: string): Promise<void>;
/**
 * Copy a file from source to destination. This function will create the folders to the destination if they don't
 * exist.
 * @param {string} source
 * @param {string} dest
 * @param {boolean} overwrite
 * @returns {Promise<boolean>} true if the file was copied. false if it already existed (and overwrite === false)
 */
export declare function copyFile(source: string, dest: string, overwrite?: boolean): Promise<boolean>;
/**
 * Delete an array of files.
 * @param filesArr {Array} the strings of files. Use an inner array to concatenate paths platform specific [['path/to', 'my', 'file']]
 * @returns {Promise}
 */
export declare function deleteFiles(filesArr: string[]): Promise<void>;
export declare function removeUnallowedChars(filename: string): string;
/**
 * Creates a file if it doesn't already exist
 * @param filename
 * @param contents (optional) the contents to write into the file
 * @returns {Promise<boolean>} true if the file has been created, false if it already existed. Promise rejection in case of an error.
 */
export declare function touch(filename: string, contents?: string): Promise<boolean>;
export declare function isSafePath(pathStr: string, appDir?: string): boolean;
export declare function cleanupDir(dirPath: any, maxAgeMin: any, create?: boolean): Promise<void>;
export declare function getInstallDate(): Promise<Date>;
/**
 * Read a faile and return a promise.
 * @param {string} file
 * @param {{encoding?: "utf8" | "base64"; flag?: string}} options default utf8
 * @returns {Promise<string>}
 */
export declare function readFile(file: string, options?: {
    encoding?: "utf8" | "base64";
    flag?: string;
}): Promise<string>;
/**
 * Creates the given directory if it doesn't already exist.
 * @param {string} dirPath
 * @returns {Promise<boolean>} true if the directory was created. false if it already existed
 */
export declare function ensureDir(dirPath: string): Promise<boolean>;
/**
 * Creates a directory and subdirs recursively
 * @param {string} dirPath
 * @param {string} baseDir the base dir to start the creation from. Defaults to the applications working dir.
 * @returns {Promise<void>}
 */
export declare function ensureDirPath(dirPath: string, baseDir?: string): Promise<void>;
