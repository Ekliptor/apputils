
export function round(nr: number, numDecimals: number) {
    const factor = Math.pow(10, numDecimals)
    return Math.round(nr * factor) / factor;
}