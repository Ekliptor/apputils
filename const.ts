// added as utils.const

//os.platform() === 'win32'
//constants.LINE_ENDING = isHttpRequest() ? os.EOL + '<br>' :os.EOL

export const MINUTE_IN_SECONDS = 60
export const HOUR_IN_SECONDS = 60 * MINUTE_IN_SECONDS
export const DAY_IN_SECONDS = 24 * HOUR_IN_SECONDS
export const WEEK_IN_SECONDS = 7 * DAY_IN_SECONDS
export const MONTH_IN_SECONDS = 30 * DAY_IN_SECONDS
export const YEAR_IN_SECONDS = 365 * DAY_IN_SECONDS

export const KB_IN_BYTES = 1024
export const MB_IN_BYTES = 1024 * KB_IN_BYTES
export const GB_IN_BYTES = 1024* MB_IN_BYTES
export const TB_IN_BYTES = 1024 * GB_IN_BYTES

export const MAX_32_BIT_INT_VALUE = 2147483647 // in ms it's 24.8 days