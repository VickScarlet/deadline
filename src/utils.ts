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
