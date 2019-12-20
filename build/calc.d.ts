export declare function round(nr: number, numDecimals: number): number;
export declare function roundTo(value: number, stepSize?: number): number;
/**
 * Returns an array of ascending or equal numbers. It replaces a number by the last number if the number decreased.
 * @param nrs
 */
export declare function ensureIncreasing(nrs: number[]): number[];
/**
 * Returns the number of decimals of a.
 * For example: 0.01 -> 2
 * @param a
 */
export declare function getNumberPrecision(a: number): number;
/**
 * Returns the number of decimals of nr.
 * @param nr
 */
export declare function getDecimalCount(nr: number): number;
