"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDecimalCount = exports.getNumberPrecision = exports.ensureIncreasing = exports.roundTo = exports.round = void 0;
function round(nr, numDecimals) {
    var factor = Math.pow(10, numDecimals);
    return Math.round(nr * factor) / factor;
}
exports.round = round;
function roundTo(value, stepSize) {
    if (stepSize === void 0) { stepSize = 1.0; }
    var inverse = 1.0 / stepSize;
    return Math.round(value * inverse) / inverse;
}
exports.roundTo = roundTo;
// export function roundInteger(int: number, base: number) {
//     return Math.round(int / base) * base;
// }
/**
 * Returns an array of ascending or equal numbers. It replaces a number by the last number if the number decreased.
 * @param nrs
 */
function ensureIncreasing(nrs) {
    var last = Number.NEGATIVE_INFINITY;
    var ascending = [];
    for (var i = 0; i < nrs.length; i++) {
        if (nrs[i] < last)
            ascending.push(last);
        else {
            ascending.push(nrs[i]);
            last = nrs[i];
        }
    }
    return ascending;
}
exports.ensureIncreasing = ensureIncreasing;
/**
 * Returns the number of decimals of a.
 * For example: 0.01 -> 2
 * @param a
 */
function getNumberPrecision(a) {
    if (!isFinite(a))
        return 0;
    var e = 1, p = 0;
    while (Math.round(a * e) / e !== a) {
        e *= 10;
        p++;
    }
    return p;
}
exports.getNumberPrecision = getNumberPrecision;
/**
 * Returns the number of decimals of nr.
 * @param nr
 */
function getDecimalCount(nr) {
    if (Math.floor(nr) === nr)
        return 0;
    return (nr + "").split(".")[1].length || 0;
}
exports.getDecimalCount = getDecimalCount;
