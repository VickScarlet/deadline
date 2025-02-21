export function callNow(fn: () => void) {
    fn()
    return fn
}

export function fill0(num: number, length = 2) {
    return num.toString().padStart(length, '0')
}

export function zoneRandom(min: number, max: number) {
    return Math.random() * (max - min) + min
}

export interface DateFormat {
    YYYY: string
    MM: string
    DD: string
    hh: string
    mm: string
    ss: string
}
export function formatDate(date: Date) {
    return {
        YYYY: date.getFullYear().toString(),
        MM: fill0(date.getMonth() + 1),
        DD: fill0(date.getDate()),
        hh: fill0(date.getHours()),
        mm: fill0(date.getMinutes()),
        ss: fill0(date.getSeconds()),
    }
}

export function yearsLater(year: number) {
    const date = new Date()
    date.setFullYear(date.getFullYear() + Math.floor(year))
    date.setDate(date.getDate() + (year % 1) * 365)
    return formatDate(date)
}

export function normalCDF(x: number, mean: number, std: number): number {
    const z = (x - mean) / std
    return 0.5 * (1 + erf(z / Math.sqrt(2)))
}

function erf(x: number): number {
    // Approximation of the error function
    const sign = x >= 0 ? 1 : -1
    x = Math.abs(x)

    const a1 = 0.254829592
    const a2 = -0.284496736
    const a3 = 1.421413741
    const a4 = -1.453152027
    const a5 = 1.061405429
    const p = 0.3275911

    const t = 1.0 / (1.0 + p * x)
    const y =
        1.0 -
        ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x)

    return sign * y
}

export function weibullCDF(x: number, k: number, scale: number): number {
    if (x < 0) {
        return 0
    }
    return 1 - Math.exp(-Math.pow(x / scale, k))
}

export function logNormalCDF(x: number, mean: number, std: number): number {
    if (x <= 0) {
        return 0
    }
    const z = (Math.log(x) - mean) / std
    return 0.5 * (1 + erf(z / Math.sqrt(2)))
}
