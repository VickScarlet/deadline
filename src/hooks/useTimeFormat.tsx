import { useState, useEffect } from 'react'
import { fill0 } from '@/utils'
import type { FormatData } from './useLanguage'

const Y = 31536000
const M = 2628000
const D = 86400
const H = 3600
export interface Time extends FormatData {
    YY: string
    MM: string
    DD: string
    hh: string
    mm: string
    ss: string
}

type Return = [
    Time,
    setTime: (time: number) => void,
    setPassed: (pass: number) => void
]
export function useTimeFormat(time: number, pass = 0): Return {
    const [mt, setTime] = useState(time)
    const [passed, setPassed] = useState(pass)
    const [data, setData] = useState<Time>({
        YY: '00',
        MM: '00',
        DD: '00',
        hh: '00',
        mm: '00',
        ss: '00',
    })
    useEffect(() => {
        const t = Math.max(mt * Y - passed, 0)
        const YY = Math.floor(t / Y)
        const MM = Math.floor((t - YY * Y) / M)
        const DD = Math.floor((t - YY * Y - MM * M) / D)
        const hh = Math.floor((t / H) % 24)
        const mm = Math.floor((t / 60) % 60)
        const ss = Math.floor(t % 60)

        setData({
            YY: fill0(YY),
            MM: fill0(MM),
            DD: fill0(DD),
            hh: fill0(hh),
            mm: fill0(mm),
            ss: fill0(ss),
        })
    }, [mt, passed])
    return [data, setTime, setPassed]
}

export default useTimeFormat
