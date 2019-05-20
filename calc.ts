
export function round(nr: number, numDecimals: number) {
    const factor = Math.pow(10, numDecimals)
    return Math.round(nr * factor) / factor;
}

export function roundTo(value: number, stepSize: number = 1.0) {
    let inverse = 1.0 / stepSize;
    return Math.round(value * inverse) / inverse;
}

/**
 * Returns an array of ascending or equal numbers. It replaces a number by the last number if the number decreased.
 * @param nrs
 */
export function ensureIncreasing(nrs: number[]): number[] {
    let last = Number.NEGATIVE_INFINITY;
    let ascending: number[] = [];
    for (let i = 0; i < nrs.length; i++)
    {
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
export function getNumberPrecision(a: number): number {
    if (!isFinite(a))
        return 0;
    let e = 1, p = 0;
    while (Math.round(a * e) / e !== a) {
        e *= 10; p++;
    }
    return p;
}

/**
 * Returns the number of decimals of nr.
 * @param nr
 */
export function getDecimalCount(nr: number): number {
    if (Math.floor(nr) === nr)
        return 0;
    return (nr + "").split(".")[1].length || 0;
}