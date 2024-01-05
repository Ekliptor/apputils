"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureDirPath = exports.ensureDir = exports.readFile = exports.getInstallDate = exports.cleanupDir = exports.isSafePath = exports.touch = exports.removeUnallowedChars = exports.deleteFiles = exports.copyFile = exports.copy = exports.getDirFromPath = exports.getNameFromPath = exports.getFileExtension = exports.getExistingFiles = exports.listDir = exports.removeFolder = exports.getFileSize = exports.getFolderSize = exports.fileExists = void 0;
//let logger = require('../../src/utils/Logger')
var fs = require("fs");
var path = require("path");
var utils = require("./utils.js");
var utils_1 = require("./utils");
function fileExists(location, orDirectory) {
    if (orDirectory === void 0) { orDirectory = true; }
    try {
        var file = fs.statSync(location);
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
    var _this = this;
    fs.lstat(folderPath, function (err, stat) {
        if (err)
            return callback(err);
        var totalSize = stat.size; // 0 for folders
        if (stat.isDirectory() === true) {
            fs.readdir(folderPath, function (err, files) {
                if (err)
                    return callback(err);
                Promise.all(files.map(function (file) {
                    return new Promise(function (resolve, reject) {
                        _this.getFolderSize(path.join(folderPath, file), function (err, size) {
                            totalSize += size;
                            resolve(totalSize);
                        });
                    });
                })).then(function (size) {
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
function getFileSize(filePath) {
    return __awaiter(this, void 0, void 0, function () {
        var stats, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fs.promises.stat(filePath)];
                case 1:
                    stats = _a.sent();
                    return [2 /*return*/, stats.size];
                case 2:
                    err_1 = _a.sent();
                    if (err_1 && err_1.code === 'ENOENT')
                        return [2 /*return*/, 0];
                    throw err_1;
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.getFileSize = getFileSize;
/**
 * Delete a folder (or single file) with all its files recursively.
 * @param folderPath
 * @param callback(err)
 */
function removeFolder(folderPath, callback) {
    fs.lstat(folderPath, function (err, stat) {
        if (err) {
            if (err.code === 'ENOENT') // swallow "no such file or directory"
                return callback();
            return callback(err);
        }
        if (stat.isDirectory() === true) {
            fs.readdir(folderPath, function (err, files) {
                if (err)
                    return callback(err);
                Promise.all(files.map(function (file) {
                    return new Promise(function (resolve, reject) {
                        removeFolder(path.join(folderPath, file), function (err) {
                            resolve(err);
                        });
                    });
                })).then(function (err) {
                    fs.rmdir(folderPath, callback);
                });
            });
        }
        else {
            fs.unlink(folderPath, function (err) {
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
    var _this = this;
    if (typeof replacePath === 'undefined') // only set this on root level. used to generate relative paths
        replacePath = new RegExp('^' + utils.escapeRegex(folderPath)); // set replacePath to empty string or custom regex to disable/change replacement
    fs.readdir(folderPath, function (err, files) {
        if (err)
            return callback(err);
        var dirFiles = [];
        var pending = files.length;
        if (pending === 0)
            return callback(err, dirFiles);
        files.forEach(function (file) {
            var fullpath = path.join(folderPath, file);
            fs.stat(fullpath, function (err, stat) {
                if (err) {
                    if (--pending === 0)
                        return callback(err);
                    return;
                }
                if (stat.isDirectory() === true) {
                    _this.listDir(fullpath, function (err, files) {
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
    Promise.all(filesArr.map(function (file) {
        return new Promise(function (resolve, reject) {
            fs.stat(file, function (err, stat) {
                if (err)
                    return resolve(null); // don't reject because the purpose of this function is to check wheter files exist
                resolve(file); // file or dir
            });
        });
    })).then(function (existingFilesArr) {
        callback(existingFilesArr.filter(function (file) {
            return file !== null;
        }));
    });
}
exports.getExistingFiles = getExistingFiles;
function getFileExtension(name, withDot, defaultExt) {
    if (withDot === void 0) { withDot = true; }
    if (defaultExt === void 0) { defaultExt = ''; }
    var pos = name.lastIndexOf('.');
    if (pos === -1)
        return defaultExt;
    if (withDot === false)
        pos++;
    var extension = name.substr(pos);
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
    var pos = path.lastIndexOf('/');
    if (pos === -1)
        return path;
    return path.substr(pos + 1);
}
exports.getNameFromPath = getNameFromPath;
function getDirFromPath(path) {
    var pos = path.lastIndexOf('/');
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
    return new Promise(function (resolve, reject) {
        var rd = fs.createReadStream(source);
        rd.on("error", function (err) {
            reject(err); // promise can only resolve once if both streams have errors
        });
        var wr = fs.createWriteStream(target);
        wr.on("error", function (err) {
            reject(err);
        });
        wr.on("close", function (ex) {
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
function copyFile(source, dest, overwrite) {
    if (overwrite === void 0) { overwrite = true; }
    return new Promise(function (resolve, reject) {
        var destDirBase = path.dirname(dest);
        ensureDirPath(destDirBase).then(function () {
            var flags = undefined;
            if (overwrite !== true)
                flags = fs.constants.COPYFILE_EXCL;
            fs.copyFile(source, dest, flags, function (err) {
                if (err) {
                    if (err.code === "EEXIST" && overwrite === false)
                        return resolve(false);
                    return reject({ txt: "Error copying single file", err: err });
                }
                resolve(true);
            });
        }).catch(function (err) {
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
    return new Promise(function (resolve, reject) {
        var deleteOps = [];
        filesArr.forEach(function (file) {
            deleteOps.push(new Promise(function (resolve, reject) {
                if (typeof file !== "string") // type: string[] == object
                    file = path.join.apply(path, file);
                fs.unlink(file, function (err) {
                    if (err) {
                        if (err.code === "ENOENT") // file doesn't exist anymore, continue
                            return resolve();
                        return reject(err);
                    }
                    resolve();
                });
            }));
        });
        Promise.all(deleteOps).then(function () {
            resolve();
        }).catch(function (err) {
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
function touch(filename, contents) {
    if (contents === void 0) { contents = ""; }
    return new Promise(function (resolve, reject) {
        fs.stat(filename, function (err, stats) {
            if (err) {
                if (err.code === "ENOENT") {
                    fs.writeFile(filename, contents, { encoding: "utf8" }, function (err) {
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
function isSafePath(pathStr, appDir) {
    if (appDir === void 0) { appDir = ""; }
    if (!appDir)
        appDir = utils.appDir;
    pathStr = path.resolve(pathStr);
    if (pathStr.substr(0, appDir.length) !== appDir)
        return false;
    return true;
}
exports.isSafePath = isSafePath;
function cleanupDir(dirPath, maxAgeMin, create) {
    if (create === void 0) { create = true; }
    return new Promise(function (resolve, reject) {
        fs.readdir(dirPath, function (err, files) {
            if (err) {
                if (err.code === 'ENOENT') {
                    if (!create)
                        return resolve();
                    return fs.mkdir(dirPath, function (err) {
                        if (err)
                            utils_1.logger.error('Error creating temp dir', err);
                    });
                }
                return utils_1.logger.error('Error cleaning temp dir', err);
            }
            var cleanups = [];
            var maxAge = new Date().getTime() - maxAgeMin * 60 * 1000;
            files.forEach(function (file) {
                cleanups.push(new Promise(function (resolve, reject) {
                    var filePath = path.join(dirPath, file);
                    fs.lstat(filePath, function (err, stats) {
                        if (err) {
                            utils_1.logger.error(JSON.stringify(err));
                            return resolve(); // continue
                        }
                        var created = new Date(stats.ctime);
                        // only delete root files. other parts of this app might write different things in here
                        if (stats.isFile() && created.getTime() < maxAge) {
                            fs.unlink(filePath, function (err) {
                                if (err)
                                    utils_1.logger.error(JSON.stringify(err));
                            });
                        }
                        resolve();
                    });
                }));
            });
            Promise.all(cleanups).then(function () {
                resolve();
            }).catch(function (err) {
                utils_1.logger.error('Error cleaning up temp dir', err);
                resolve(); // continue cleaning
            });
        });
    });
}
exports.cleanupDir = cleanupDir;
function getInstallDate() {
    return new Promise(function (resolve, reject) {
        var checkFiles = ["updater.json", "package.json"]; // package.json is not always modified on update, check it last
        var checkNextFile = function (filename) {
            var packageFile = path.join(utils.appDir, filename);
            fs.lstat(packageFile, function (err, stat) {
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
    return new Promise(function (resolve, reject) {
        if (!options)
            options = {};
        if (!options.encoding)
            options.encoding = "utf8";
        fs.readFile(file, options, function (err, data) {
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
    return new Promise(function (resolve, reject) {
        fs.stat(dirPath, function (err, stats) {
            if (err) {
                if (err.code !== "ENOENT")
                    return reject({ txt: "Error getting file stats for dir", err: err });
            }
            else if (stats.isDirectory() === true)
                return resolve(false);
            fs.mkdir(dirPath, function (err) {
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
function ensureDirPath(dirPath, baseDir) {
    if (baseDir === void 0) { baseDir = ""; }
    return __awaiter(this, void 0, void 0, function () {
        var dirParts, curPath, i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    dirParts = dirPath.split(path.sep);
                    curPath = baseDir ? baseDir : path.parse(dirPath).root;
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < dirParts.length)) return [3 /*break*/, 4];
                    if (!dirParts[i])
                        return [3 /*break*/, 3];
                    if (curPath.length === 0)
                        curPath = dirParts[i];
                    else
                        curPath = path.join(curPath, dirParts[i]);
                    return [4 /*yield*/, ensureDir(curPath)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.ensureDirPath = ensureDirPath;
