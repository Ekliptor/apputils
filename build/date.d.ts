export type DateInterval = "year" | "quarter" | "month" | "week" | "day" | "hour" | "minute" | "second";
export interface DateRange {
    start: Date;
    end: Date;
}
export declare function dateFromString(date: string): Date;
export declare function dateFromJson(obj: any, datePros: string[]): any;
export declare function dateFromJsonArr(objArr: any[], dateProps: string[]): any[];
/**
 * Create a new Date just like with the Date() constructor, but with UTC values instead of local values.
 * @returns {Date}
 */
export declare function dateFromUtc(year: number, month: number, date?: number, hours?: number, minutes?: number, seconds?: number, ms?: number): Date;
/**
 * Adds the given units of interval to the date.
 * It returns a copy of the date, so the given date is not modified.
 * @param date
 * @param interval
 * @param units
 */
export declare function dateAdd(date: Date, interval: DateInterval, units: number): Date;
export declare function createDateAsUTC(date: Date): Date;
export declare function convertDateToUTC(date: Date): Date;
export declare function getOtherServerDate(serverTimezoneOffset: number, ms?: boolean): number;
export declare function getDateInTimezone(date: Date, timezoneOffset: number): Date;
/**
 * Return a readable unix time string, for example: 2018-09-16 07:04:30
 * @param now
 * @param withSeconds
 * @param utc
 */
export declare function toDateTimeStr(now: Date, withSeconds?: boolean, utc?: boolean): string;
export declare function formatDate(dateFormat: string, date: Date): string;
export declare function formatTime(dateFormat: string, date: Date): string;
export declare function formatDateTime(dateFormat: string, date: Date): string;
/**
 * Parse a process date string from "etime" shell command and return it as a Date object.
 * @param elapsedStr
 */
export declare function parseElapsedUnixProcessDate(elapsedStr: string): Date;
/**
 * Get the time when a process was started
 * @param PID
 * @returns {Promise} Date object representing the time when the process was started. Returns null if the process is not running
 */
export declare function getElapsedUnixProcessTime(PID: string | number): Promise<Date>;
export declare function overlaps(range1: DateRange, range2: DateRange, allowEqual?: boolean): boolean;
export declare function parseAsGmt0(dateStr: string): Date;
/**
 * Get a HH:mm string
 * @param {number} hours
 * @param {boolean} isMinutes
 * @returns {string} HH:mm
 */
export declare function toHourMinuteStr(hours: number, isMinutes?: boolean): string;
/**
 * Get a DD:HH string
 * @param {number} days
 * @param {boolean} isHours
 * @returns {string} DD:HH
 */
export declare function toDayHourStr(days: number, isHours?: boolean): string;
