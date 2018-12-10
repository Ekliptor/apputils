
export function round(nr: number, numDecimals: number) {
    const factor = Math.pow(10, numDecimals)
    return Math.round(nr * factor) / factor;
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