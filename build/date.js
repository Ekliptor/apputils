"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dateFromString = dateFromString;
exports.dateFromJson = dateFromJson;
exports.dateFromJsonArr = dateFromJsonArr;
exports.dateFromUtc = dateFromUtc;
exports.dateAdd = dateAdd;
exports.createDateAsUTC = createDateAsUTC;
exports.convertDateToUTC = convertDateToUTC;
exports.getOtherServerDate = getOtherServerDate;
exports.getDateInTimezone = getDateInTimezone;
exports.toDateTimeStr = toDateTimeStr;
exports.formatDate = formatDate;
exports.formatTime = formatTime;
exports.formatDateTime = formatDateTime;
exports.parseElapsedUnixProcessDate = parseElapsedUnixProcessDate;
exports.getElapsedUnixProcessTime = getElapsedUnixProcessTime;
exports.overlaps = overlaps;
exports.parseAsGmt0 = parseAsGmt0;
exports.toHourMinuteStr = toHourMinuteStr;
exports.toDayHourStr = toDayHourStr;
const utils = require("./utils");
const childProcess = require("child_process");
const exec = childProcess.exec;
const os = require("os");
function dateFromString(date) {
    return new Date(date.replace(" ", "T"));
}
function dateFromJson(obj, datePros) {
    for (let prop of datePros) {
        if (obj[prop])
            obj[prop] = new Date(obj[prop]);
    }
    return obj;
}
function dateFromJsonArr(objArr, dateProps) {
    for (let i = 0; i < objArr.length; i++) {
        objArr[i] = dateFromJson(objArr[i], dateProps);
    }
    return objArr;
}
/**
 * Create a new Date just like with the Date() constructor, but with UTC values instead of local values.
 * @returns {Date}
 */
function dateFromUtc(year, month, date, hours, minutes, seconds, ms) {
    let utcDate = new Date(year, month, date, hours, minutes, seconds, ms);
    utcDate.setUTCFullYear(year);
    utcDate.setUTCMonth(month);
    utcDate.setUTCDate(date);
    if (typeof hours === "number")
        utcDate.setUTCHours(hours);
    if (typeof minutes === "number")
        utcDate.setUTCMinutes(minutes);
    if (typeof seconds === "number")
        utcDate.setUTCSeconds(seconds);
    if (typeof ms === "number")
        utcDate.setUTCMilliseconds(ms);
    return utcDate;
}
// getCurrentTick() in utils
/**
 * Adds the given units of interval to the date.
 * It returns a copy of the date, so the given date is not modified.
 * @param date
 * @param interval
 * @param units
 */
function dateAdd(date, interval, units) {
    let ret = new Date(date); //don't change original date
    switch (interval.toLowerCase()) {
        case 'year':
            ret.setFullYear(ret.getFullYear() + units);
            break;
        case 'quarter':
            ret.setMonth(ret.getMonth() + 3 * units);
            break;
        case 'month':
            ret.setMonth(ret.getMonth() + units);
            break;
        case 'week':
            ret.setDate(ret.getDate() + 7 * units);
            break;
        case 'day':
            ret.setDate(ret.getDate() + units);
            break;
        case 'hour':
            ret.setTime(ret.getTime() + units * 3600000);
            break;
        case 'minute':
            ret.setTime(ret.getTime() + units * 60000);
            break;
        case 'second':
            ret.setTime(ret.getTime() + units * 1000);
            break;
        default:
            ret = undefined;
            break;
    }
    return ret;
}
function createDateAsUTC(date) {
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));
}
function convertDateToUTC(date) {
    return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
}
function getOtherServerDate(serverTimezoneOffset, ms = true) {
    // new Date("2016-10-18 21:51:52+00:00 GMT+0200") for germany in DST, otherwise GMT+0100 (hhmm)
    var date = new Date();
    var msDate = date.getTime() + (date.getTimezoneOffset() - serverTimezoneOffset) * 60000;
    return ms === true ? msDate : msDate / 1000;
}
function getDateInTimezone(date, timezoneOffset) {
    var msDate = date.getTime() + (date.getTimezoneOffset() - timezoneOffset) * 60000;
    return new Date(msDate);
}
/**
 * Return a readable unix time string, for example: 2018-09-16 07:04:30
 * @param now
 * @param withSeconds
 * @param utc
 */
function toDateTimeStr(now, withSeconds = true, utc = true) {
    if (utc === true) {
        let date = now.getUTCFullYear() + '-' + utils.padNumber(now.getUTCMonth() + 1, 2) + '-' + utils.padNumber(now.getUTCDate(), 2);
        if (withSeconds)
            date += ' ' + utils.padNumber(now.getUTCHours(), 2) + ':' + utils.padNumber(now.getUTCMinutes(), 2) + ':' + utils.padNumber(now.getUTCSeconds(), 2);
        return date;
    }
    let date = now.getFullYear() + '-' + utils.padNumber(now.getMonth() + 1, 2) + '-' + utils.padNumber(now.getDate(), 2);
    if (withSeconds)
        date += ' ' + utils.padNumber(now.getHours(), 2) + ':' + utils.padNumber(now.getMinutes(), 2) + ':' + utils.padNumber(now.getSeconds(), 2);
    return date;
}
function formatDate(dateFormat, date) {
    return dateFormat.replace("DD", utils.padNumber(date.getDate(), 2)).replace("MM", utils.padNumber(date.getMonth() + 1, 2)).replace("YYYY", date.getFullYear().toString());
}
function formatTime(dateFormat, date) {
    return dateFormat.replace("HH", utils.padNumber(date.getHours(), 2)).replace("ii", utils.padNumber(date.getMinutes(), 2)).replace("ss", utils.padNumber(date.getSeconds(), 2));
}
function formatDateTime(dateFormat, date) {
    let result = formatDate(dateFormat, date);
    return formatTime(result, date);
}
/**
 * Parse a process date string from "etime" shell command and return it as a Date object.
 * @param elapsedStr
 */
function parseElapsedUnixProcessDate(elapsedStr) {
    let elapsed = new Date();
    if (!elapsedStr)
        return elapsed;
    let parts = elapsedStr.split("-"); // 2-16:04:57
    let i = 0; // the index for time
    if (parts.length === 2) { // days and time
        elapsed = utils.date.dateAdd(elapsed, 'day', -1 * parseInt(parts[0]));
        i = 1;
    }
    let timeParts = parts[i].split(":"); // valid is 12:04:31 and 04:31
    if (timeParts.length === 3)
        elapsed = utils.date.dateAdd(elapsed, 'hour', -1 * parseInt(timeParts.shift()));
    elapsed = utils.date.dateAdd(elapsed, 'minute', -1 * parseInt(timeParts.shift()));
    elapsed = utils.date.dateAdd(elapsed, 'second', -1 * parseInt(timeParts.shift()));
    return elapsed;
}
/**
 * Get the time when a process was started
 * @param PID
 * @returns {Promise} Date object representing the time when the process was started. Returns null if the process is not running
 */
function getElapsedUnixProcessTime(PID) {
    return new Promise((resolve, reject) => {
        if (os.platform() === 'win32')
            return reject("Getting elapsed process time is not supported on windows"); // TODO
        let options = null;
        // http://linuxcommando.blogspot.de/2008/09/how-to-get-process-start-date-and-time.html
        const child = exec("ps axo pid,etime | grep " + PID + " | awk '{print $2}'", options, (err, stdout, stderr) => {
            if (err)
                return reject(err);
            stdout = stdout.trim();
            if (!stdout)
                return resolve(null);
            resolve(parseElapsedUnixProcessDate(stdout));
        });
    });
}
function overlaps(range1, range2, allowEqual = false) {
    if (!range1 || !range2)
        return false;
    const e1start = range1.start.getTime();
    const e1end = range1.end.getTime();
    const e2start = range2.start.getTime();
    const e2end = range2.end.getTime();
    if (allowEqual === true)
        return (e1start >= e2start && e1start <= e2end) || (e2start >= e1start && e2start <= e1end);
    return (e1start > e2start && e1start < e2end) || (e2start > e1start && e2start < e1end);
}
function parseAsGmt0(dateStr) {
    if (dateStr.indexOf(" GMT+0000") !== -1)
        return new Date(dateStr);
    return new Date(dateStr + " GMT+0000");
}
/**
 * Get a HH:mm string
 * @param {number} hours
 * @param {boolean} isMinutes
 * @returns {string} HH:mm
 */
function toHourMinuteStr(hours, isMinutes = false) {
    if (isMinutes)
        hours /= 60;
    let fullHours = Math.floor(hours);
    let minutes = Math.floor((hours - fullHours) * 60);
    return utils.padNumber(fullHours, 2) + ":" + utils.padNumber(minutes, 2);
}
/**
 * Get a DD:HH string
 * @param {number} days
 * @param {boolean} isHours
 * @returns {string} DD:HH
 */
function toDayHourStr(days, isHours = false) {
    if (isHours)
        days /= 24;
    let fullDays = Math.floor(days);
    let hours = Math.floor((days - fullDays) * 24);
    return utils.padNumber(fullDays, 2) + ":" + utils.padNumber(hours, 2);
}
// to check if DST is in effect on LOCAL time: http://stackoverflow.com/questions/11887934/check-if-daylight-saving-time-is-in-effect-and-if-it-is-for-how-many-hours
//# sourceMappingURL=date.js.map