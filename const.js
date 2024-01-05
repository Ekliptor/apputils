"use strict";
// added as utils.const
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_32_BIT_INT_VALUE = exports.TB_IN_BYTES = exports.GB_IN_BYTES = exports.MB_IN_BYTES = exports.KB_IN_BYTES = exports.YEAR_IN_SECONDS = exports.MONTH_IN_SECONDS = exports.WEEK_IN_SECONDS = exports.DAY_IN_SECONDS = exports.HOUR_IN_SECONDS = exports.MINUTE_IN_SECONDS = void 0;
//os.platform() === 'win32'
//constants.LINE_ENDING = isHttpRequest() ? os.EOL + '<br>' :os.EOL
exports.MINUTE_IN_SECONDS = 60;
exports.HOUR_IN_SECONDS = 60 * exports.MINUTE_IN_SECONDS;
exports.DAY_IN_SECONDS = 24 * exports.HOUR_IN_SECONDS;
exports.WEEK_IN_SECONDS = 7 * exports.DAY_IN_SECONDS;
exports.MONTH_IN_SECONDS = 30 * exports.DAY_IN_SECONDS;
exports.YEAR_IN_SECONDS = 365 * exports.DAY_IN_SECONDS;
exports.KB_IN_BYTES = 1024;
exports.MB_IN_BYTES = 1024 * exports.KB_IN_BYTES;
exports.GB_IN_BYTES = 1024 * exports.MB_IN_BYTES;
exports.TB_IN_BYTES = 1024 * exports.GB_IN_BYTES;
exports.MAX_32_BIT_INT_VALUE = 2147483647; // in ms it's 24.8 days
