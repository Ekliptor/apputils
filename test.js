"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertUnreachableCode = exports.dumpError = exports.getPassedTime = exports.createObject = exports.readData = void 0;
var fs = require("fs");
function readData(path, cb) {
    fs.readFile(path, 'utf8', function (err, data) {
        if (err)
            return cb(err);
        var testData = JSON.parse(data).data;
        cb(testData);
    });
}
exports.readData = readData;
function createObject(base, extend) {
    return Object.assign(base, extend);
}
exports.createObject = createObject;
function getPassedTime(startMs, endMs) {
    if (endMs === void 0) { endMs = null; }
    if (endMs == null)
        endMs = Date.now();
    var totalTime = endMs - startMs;
    if (totalTime === Number.NaN || totalTime < 0)
        totalTime = 0;
    var timeStr = totalTime + "";
    if (totalTime < 1000)
        timeStr = totalTime + ' ms';
    else if (totalTime < 1000 * 60)
        timeStr = Math.floor(totalTime / 1000) + ' sec';
    else if (totalTime < 1000 * 60 * 60)
        timeStr = Math.floor(totalTime / (1000 * 60)) + ' min';
    else //if (totalTime < 1000*60*60*24)
        timeStr = Math.floor(totalTime / (1000 * 60 * 60)) + ' h';
    return timeStr;
}
exports.getPassedTime = getPassedTime;
function dumpError(err, logger) {
    if (logger === void 0) { logger = null; }
    if (logger === null)
        logger = console;
    var output = '';
    // log() with 1 argument is only available on console logger. debug()/error() on winston & console
    if (!err)
        return output;
    if (typeof err === 'object' && err.stack) {
        logger.error('Error:');
        output += 'Error:\r\n';
        if (err.message) {
            logger.error('Message: ' + err.message);
            output += 'Message: ' + err.message + '\r\n';
        }
        if (err.stack) {
            logger.error('Stacktrace:');
            logger.error('====================');
            logger.error(err.stack);
            output += 'Stacktrace:\r\n====================\r\n' + JSON.stringify(err.stack, null, 4);
        }
    }
    else {
        logger.error(err);
        output += JSON.stringify(err, null, 4);
    }
    output += '\r\n';
    return output;
}
exports.dumpError = dumpError;
function assertUnreachableCode(x) {
    throw new Error("Unexpected object: " + x);
}
exports.assertUnreachableCode = assertUnreachableCode;
