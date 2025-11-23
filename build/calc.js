"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.round = round;
exports.roundTo = roundTo;
exports.ensureIncreasing = ensureIncreasing;
exports.getNumberPrecision = getNumberPrecision;
exports.getDecimalCount = getDecimalCount;
function round(nr, numDecimals) {
    const factor = Math.pow(10, numDecimals);
    return Math.round(nr * factor) / factor;
}
function roundTo(value, stepSize = 1.0) {
    let inverse = 1.0 / stepSize;
    return Math.round(value * inverse) / inverse;
}
// export function roundInteger(int: number, base: number) {
//     return Math.round(int / base) * base;
// }
/**
 * Returns an array of ascending or equal numbers. It replaces a number by the last number if the number decreased.
 * @param nrs
 */
function ensureIncreasing(nrs) {
    let last = Number.NEGATIVE_INFINITY;
    let ascending = [];
    for (let i = 0; i < nrs.length; i++) {
        if (nrs[i] < last)
            ascending.push(last);
        else {
            ascending.push(nrs[i]);
            last = nrs[i];
        }
    }
    return ascending;
}
/**
 * Returns the number of decimals of a.
 * For example: 0.01 -> 2
 * @param a
 */
function getNumberPrecision(a) {
    if (!isFinite(a))
        return 0;
    let e = 1, p = 0;
    while (Math.round(a * e) / e !== a) {
        e *= 10;
        p++;
    }
    return p;
}
/**
 * Returns the number of decimals of nr.
 * @param nr
 */
function getDecimalCount(nr) {
    if (Math.floor(nr) === nr)
        return 0;
    return (nr + "").split(".")[1].length || 0;
}
//# sourceMappingURL=calc.js.map