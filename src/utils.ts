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
