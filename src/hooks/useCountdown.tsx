import { useState, useEffect } from 'react'
import { fill0, callNow } from '@/utils'
import { getLifeSeconds, calcLife } from '@/data'
import type { FormatData } from './useLanguage'
export interface Time extends FormatData {
    YY: string
    MM: string
    DD: string
    hh: string
    mm: string
    ss: string
}

export type Return = [
    Time,
    setTime: (time: number) => void,
    setStart: (pass: number) => void
]
export function useCountdown(time: number, start: number): Return {
    const [mt, setTime] = useState(time)
    const [ms, setStart] = useState(start)
    const [seconds, setSeconds] = useState(0)
    const [data, setData] = useState<Time>({
        YY: '00',
        MM: '00',
        DD: '00',
        hh: '00',
        mm: '00',
        ss: '00',
    })
    useEffect(() => {
        const life = calcLife(seconds)
        setData({
            YY: fill0(life.Y),
            MM: fill0(life.M),
            DD: fill0(life.D),
            hh: fill0(life.h),
            mm: fill0(life.m),
            ss: fill0(life.s),
        })
    }, [seconds])
    useEffect(() => {
        const interval = setInterval(
            callNow(() => {
                const passed = Math.floor((Date.now() - ms) / 1000)
                const life = getLifeSeconds(mt)
                setSeconds(Math.max(life - passed, 0))
            }),
            1000
        )
        return () => clearInterval(interval)
    }, [mt, ms])
    return [data, setTime, setStart]
}

export default useCountdown
