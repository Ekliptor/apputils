"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureDirPath = exports.ensureDir = exports.readFile = exports.getInstallDate = exports.cleanupDir = exports.isSafePath = exports.touch = exports.removeUnallowedChars = exports.deleteFiles = exports.copyFile = exports.copy = exports.getDirFromPath = exports.getNameFromPath = exports.getFileExtension = exports.getExistingFiles = exports.listDir = exports.removeFolder = exports.getFileSize = exports.getFolderSize = exports.fileExists = void 0;
//let logger = require('../../src/utils/Logger')
const fs = require("fs");
const path = require("path");
const utils = require("./utils.js");
const utils_1 = require("./utils");
function fileExists(location, orDirectory = true) {
    try {
        let file = fs.statSync(location);
        if (file.isFile())
            return true;
        else if (orDirectory && file.isDirectory())
            return true;
    }
    catch (error) { }
    return false;
}
exports.fileExists = fileExists;
function getFolderSize(folderPath, callback) {
    fs.lstat(folderPath, (err, stat) => {
        if (err)
            return callback(err);
        let totalSize = stat.size; // 0 for folders
        if (stat.isDirectory() === true) {
            fs.readdir(folderPath, (err, files) => {
                if (err)
                    return callback(err);
                Promise.all(files.map((file) => {
                    return new Promise((resolve, reject) => {
                        this.getFolderSize(path.join(folderPath, file), (err, size) => {
                            totalSize += size;
                            resolve(totalSize);
                        });
                    });
                })).then((size) => {
                    callback(err, totalSize); // if we traveresd only down 1 folder [size] == totalSize
                });
            });
        }
        else
            callback(err, totalSize);
    });
}
exports.getFolderSize = getFolderSize;
/**
 * Get the size in bytes of a file (symbolic links followed).
 * If the file doesn't exist this function returns 0.
 * @param filePath
 */
async function getFileSize(filePath) {
    try {
        let stats = await fs.promises.stat(filePath);
        return stats.size;
    }
    catch (err) {
        if (err && err.code === 'ENOENT')
            return 0;
        throw err;
    }
}
exports.getFileSize = getFileSize;
/**
 * Delete a folder (or single file) with all its files recursively.
 * @param folderPath
 * @param callback(err)
 */
function removeFolder(folderPath, callback) {
    fs.lstat(folderPath, (err, stat) => {
        if (err) {
            if (err.code === 'ENOENT') // swallow "no such file or directory"
                return callback();
            return callback(err);
        }
        if (stat.isDirectory() === true) {
            fs.readdir(folderPath, (err, files) => {
                if (err)
                    return callback(err);
                Promise.all(files.map((file) => {
                    return new Promise((resolve, reject) => {
                        removeFolder(path.join(folderPath, file), (err) => {
                            resolve(err);
                        });
                    });
                })).then((err) => {
                    fs.rmdir(folderPath, callback);
                });
            });
        }
        else {
            fs.unlink(folderPath, (err) => {
                callback(err);
            });
        }
    });
}
exports.removeFolder = removeFolder;
/**
 * Recursively lists all files in a folder. Only files are returned. Folders do not get a separate entry.
 * Instead they are part of the relative path of the listed files.
 * The returned paths will be relative to folderPath
 * @param folderPath
 * @param callback
 * @param replacePath
 */
function listDir(folderPath, callback, replacePath) {
    if (typeof replacePath === 'undefined') // only set this on root level. used to generate relative paths
        replacePath = new RegExp('^' + utils.escapeRegex(folderPath)); // set replacePath to empty string or custom regex to disable/change replacement
    fs.readdir(folderPath, (err, files) => {
        if (err)
            return callback(err);
        let dirFiles = [];
        let pending = files.length;
        if (pending === 0)
            return callback(err, dirFiles);
        files.forEach((file) => {
            const fullpath = path.join(folderPath, file);
            fs.stat(fullpath, (err, stat) => {
                if (err) {
                    if (--pending === 0)
                        return callback(err);
                    return;
                }
                if (stat.isDirectory() === true) {
                    this.listDir(fullpath, (err, files) => {
                        if (err) {
                            if (--pending === 0)
                                return callback(err);
                            return;
                        }
                        dirFiles = dirFiles.concat(files); // recursively add the files we found in the sub directories to the list
                        if (--pending === 0)
                            callback(err, dirFiles);
                    }, replacePath);
                }
                else {
                    dirFiles.push(fullpath.replace(replacePath, '')); // add a single new file
                    if (--pending === 0)
                        callback(err, dirFiles);
                }
            });
        });
    });
}
exports.listDir = listDir;
function getExistingFiles(filesArr, callback) {
    Promise.all(filesArr.map((file) => {
        return new Promise((resolve, reject) => {
            fs.stat(file, (err, stat) => {
                if (err)
                    return resolve(null); // don't reject because the purpose of this function is to check wheter files exist
                resolve(file); // file or dir
            });
        });
    })).then((existingFilesArr) => {
        callback(existingFilesArr.filter((file) => {
            return file !== null;
        }));
    });
}
exports.getExistingFiles = getExistingFiles;
function getFileExtension(name, withDot = true, defaultExt = '') {
    let pos = name.lastIndexOf('.');
    if (pos === -1)
        return defaultExt;
    if (withDot === false)
        pos++;
    let extension = name.substr(pos);
    if (extension.length > 5)
        return defaultExt;
    return extension.toLowerCase();
}
exports.getFileExtension = getFileExtension;
/**
 * Used to get names from URL paths (and UNIX style paths)
 * @param path
 * @returns {*}
 */
function getNameFromPath(path) {
    let pos = path.lastIndexOf('/');
    if (pos === -1)
        return path;
    return path.substr(pos + 1);
}
exports.getNameFromPath = getNameFromPath;
function getDirFromPath(path) {
    let pos = path.lastIndexOf('/');
    if (pos === -1)
        return path;
    return path.substr(0, pos);
}
exports.getDirFromPath = getDirFromPath;
/**
 * Copy a file from source to target.
 * @deprecated use the official fs.copyFile() instead
 * @param {string} source
 * @param {string} target
 * @returns {Promise<void>}
 */
function copy(source, target) {
    return new Promise((resolve, reject) => {
        let rd = fs.createReadStream(source);
        rd.on("error", (err) => {
            reject(err); // promise can only resolve once if both streams have errors
        });
        let wr = fs.createWriteStream(target);
        wr.on("error", (err) => {
            reject(err);
        });
        wr.on("close", (ex) => {
            resolve();
        });
        rd.pipe(wr);
    });
}
exports.copy = copy;
/**
 * Copy a file from source to destination. This function will create the folders to the destination if they don't
 * exist.
 * @param {string} source
 * @param {string} dest
 * @param {boolean} overwrite
 * @returns {Promise<boolean>} true if the file was copied. false if it already existed (and overwrite === false)
 */
function copyFile(source, dest, overwrite = true) {
    return new Promise((resolve, reject) => {
        let destDirBase = path.dirname(dest);
        ensureDirPath(destDirBase).then(() => {
            let flags = undefined;
            if (overwrite !== true)
                flags = fs.constants.COPYFILE_EXCL;
            fs.copyFile(source, dest, flags, (err) => {
                if (err) {
                    if (err.code === "EEXIST" && overwrite === false)
                        return resolve(false);
                    return reject({ txt: "Error copying single file", err: err });
                }
                resolve(true);
            });
        }).catch((err) => {
            reject(err);
        });
    });
}
exports.copyFile = copyFile;
/**
 * Delete an array of files.
 * @param filesArr {Array} the strings of files. Use an inner array to concatenate paths platform specific [['path/to', 'my', 'file']]
 * @returns {Promise}
 */
function deleteFiles(filesArr) {
    return new Promise((resolve, reject) => {
        let deleteOps = [];
        filesArr.forEach((file) => {
            deleteOps.push(new Promise((resolve, reject) => {
                if (typeof file !== "string") // type: string[] == object
                    file = path.join(...file);
                fs.unlink(file, (err) => {
                    if (err) {
                        if (err.code === "ENOENT") // file doesn't exist anymore, continue
                            return resolve();
                        return reject(err);
                    }
                    resolve();
                });
            }));
        });
        Promise.all(deleteOps).then(() => {
            resolve();
        }).catch((err) => {
            reject(err);
        });
    });
}
exports.deleteFiles = deleteFiles;
function removeUnallowedChars(filename) {
    // http://stackoverflow.com/questions/1976007/what-characters-are-forbidden-in-windows-and-linux-directory-names
    // missing: All control codes (<= 31)
    return filename.replace(/[\/\0<>:"\\|\?\*]/g, "");
}
exports.removeUnallowedChars = removeUnallowedChars;
/**
 * Creates a file if it doesn't already exist
 * @param filename
 * @param contents (optional) the contents to write into the file
 * @returns {Promise<boolean>} true if the file has been created, false if it already existed. Promise rejection in case of an error.
 */
function touch(filename, contents = "") {
    return new Promise((resolve, reject) => {
        fs.stat(filename, (err, stats) => {
            if (err) {
                if (err.code === "ENOENT") {
                    fs.writeFile(filename, contents, { encoding: "utf8" }, (err) => {
                        if (err)
                            return reject({ txt: "Error creating file", err: err });
                        resolve(true);
                    });
                    return;
                }
                return reject({ txt: "Error checking file existence", err: err });
            }
            if (!stats.isFile())
                return reject({ txt: "File to write is not a regular file", stats: stats });
            resolve(false);
        });
    });
}
exports.touch = touch;
function isSafePath(pathStr, appDir = "") {
    if (!appDir)
        appDir = utils.appDir;
    pathStr = path.resolve(pathStr);
    if (pathStr.substr(0, appDir.length) !== appDir)
        return false;
    return true;
}
exports.isSafePath = isSafePath;
function cleanupDir(dirPath, maxAgeMin, create = true) {
    return new Promise((resolve, reject) => {
        fs.readdir(dirPath, (err, files) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    if (!create)
                        return resolve();
                    return fs.mkdir(dirPath, (err) => {
                        if (err)
                            utils_1.logger.error('Error creating temp dir', err);
                    });
                }
                return utils_1.logger.error('Error cleaning temp dir', err);
            }
            let cleanups = [];
            let maxAge = new Date().getTime() - maxAgeMin * 60 * 1000;
            files.forEach((file) => {
                cleanups.push(new Promise((resolve, reject) => {
                    let filePath = path.join(dirPath, file);
                    fs.lstat(filePath, (err, stats) => {
                        if (err) {
                            utils_1.logger.error(JSON.stringify(err));
                            return resolve(); // continue
                        }
                        let created = new Date(stats.ctime);
                        // only delete root files. other parts of this app might write different things in here
                        if (stats.isFile() && created.getTime() < maxAge) {
                            fs.unlink(filePath, (err) => {
                                if (err)
                                    utils_1.logger.error(JSON.stringify(err));
                            });
                        }
                        resolve();
                    });
                }));
            });
            Promise.all(cleanups).then(() => {
                resolve();
            }).catch((err) => {
                utils_1.logger.error('Error cleaning up temp dir', err);
                resolve(); // continue cleaning
            });
        });
    });
}
exports.cleanupDir = cleanupDir;
function getInstallDate() {
    return new Promise((resolve, reject) => {
        let checkFiles = ["updater.json", "package.json"]; // package.json is not always modified on update, check it last
        let checkNextFile = (filename) => {
            const packageFile = path.join(utils.appDir, filename);
            fs.lstat(packageFile, (err, stat) => {
                if (err) {
                    if (err.code === 'ENOENT') {
                        if (checkFiles.length === 0)
                            return reject({ txt: "package.json file in appDir doesn't exist", location: packageFile, err: err });
                        checkNextFile(checkFiles.shift());
                        return;
                    }
                    return reject({ txt: "Unknown error", location: packageFile, err: err });
                }
                resolve(stat.mtime);
            });
        };
        checkNextFile(checkFiles.shift());
    });
}
exports.getInstallDate = getInstallDate;
/**
 * Read a faile and return a promise.
 * @param {string} file
 * @param {{encoding?: "utf8" | "base64"; flag?: string}} options default utf8
 * @returns {Promise<string>}
 */
function readFile(file, options) {
    // encodings: https://stackoverflow.com/questions/14551608/list-of-encodings-that-node-js-supports
    return new Promise((resolve, reject) => {
        if (!options)
            options = {};
        if (!options.encoding)
            options.encoding = "utf8";
        fs.readFile(file, options, (err, data) => {
            if (err)
                return reject(err);
            resolve(data); // already a string
        });
    });
}
exports.readFile = readFile;
/**
 * Creates the given directory if it doesn't already exist.
 * @param {string} dirPath
 * @returns {Promise<boolean>} true if the directory was created. false if it already existed
 */
function ensureDir(dirPath) {
    return new Promise((resolve, reject) => {
        fs.stat(dirPath, (err, stats) => {
            if (err) {
                if (err.code !== "ENOENT")
                    return reject({ txt: "Error getting file stats for dir", err: err });
            }
            else if (stats.isDirectory() === true)
                return resolve(false);
            fs.mkdir(dirPath, (err) => {
                if (err) {
                    if (err.code === "EEXIST")
                        return resolve(false);
                    return reject({ txt: 'Error creating dir to ensure', err: err });
                }
                resolve(true);
            });
        });
    });
}
exports.ensureDir = ensureDir;
/**
 * Creates a directory and subdirs recursively
 * @param {string} dirPath
 * @param {string} baseDir the base dir to start the creation from. Defaults to the applications working dir.
 * @returns {Promise<void>}
 */
async function ensureDirPath(dirPath, baseDir = "") {
    let dirParts = dirPath.split(path.sep);
    let curPath = baseDir ? baseDir : path.parse(dirPath).root; // usually C:\\ or /
    for (let i = 0; i < dirParts.length; i++) {
        if (!dirParts[i])
            continue;
        if (curPath.length === 0)
            curPath = dirParts[i];
        else
            curPath = path.join(curPath, dirParts[i]);
        await ensureDir(curPath);
    }
}
exports.ensureDirPath = ensureDirPath;
//# sourceMappingURL=file.js.map