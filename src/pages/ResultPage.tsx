import { useState, useEffect } from 'react'
import { useAnimate } from 'motion/react'
import { useLanguage, useTimeFormat } from '@/hooks'
import type { Country, Age, Sex, Achivement } from '@/data'
import {
    query,
    check,
    getRandom,
    getBaseLife,
    getQuestions,
    processAlt,
} from '@/data'
import { callNow } from '@/utils'
import { toast } from 'react-toastify'
import { Arrow } from '@/components/Arrow'
import Back from '@/assets/back.svg?react'
import './ResultPage.css'

export interface Options {
    country: Country
    age: Age
    sex: Sex
    start: number
}

export interface ResultPageProps {
    options: Options
    onBack: () => void
}

interface QuestionItem {
    question: string
    options: string[]
}

export function ResultPage({
    options: { country, age, sex, start },
    onBack,
}: ResultPageProps) {
    const { t } = useLanguage()

    const [base, setBase] = useState(0)
    const [alter, setAlter] = useState(0)
    const [time, setTime] = useState(0)
    const [countdown, setCountdown, setPassed] = useTimeFormat(0)
    const [questions, setQuestions] = useState<QuestionItem[]>([])
    const [alts, setAlts] = useState<number[][]>([])
    const [cursor, setCursor] = useState(0)
    const [selected, setSelected] = useState<number[]>([])
    const [lifeBorn, setLifeBorn] = useState(0)
    const [lifeDeath, setLifeDeath] = useState(0)
    const [lifeTotal, setLifeTotal] = useState(0)
    const [averageCountry, setAverageCountry] = useState(0)
    const [averageHigh, setAverageHigh] = useState(0)
    const [altWorst, setAltWorst] = useState(Infinity)
    const [altBest, setAltBest] = useState(-Infinity)
    const [achivements, setAchivements] = useState<Achivement[]>([])
    const [altArrowCount, setAltArrowCount] = useState(0)
    const [scope, animate] = useAnimate()

    useEffect(() => {
        setBase(getBaseLife(country, age, sex))
    }, [country, age, sex, start])

    useEffect(() => {
        setTime(base + alter)
        setCountdown(base + alter)
    }, [base, alter, setCountdown])

    useEffect(() => {
        setAverageHigh(query('country')[2].life[sex.value])
    }, [sex])

    useEffect(() => {
        setAverageCountry(country.life[sex.value])
    }, [country, sex])

    useEffect(() => {
        const loop = () => setPassed(Math.floor((Date.now() - start) / 1000))
        const interval = setInterval(callNow(loop), 1000)
        return () => clearInterval(interval)
    }, [start, setPassed])

    useEffect(() => {
        getQuestions(country, age, sex).then(({ questions, alts }) => {
            setQuestions(questions)
            setAlts(alts)
            setSelected(new Array(questions.length).fill(-1))
        })
    }, [country, age, sex])

    useEffect(() => {
        const born = new Date(start).getFullYear() - age.value
        const life = age.value + time
        const death = Math.floor(born + life)
        setLifeBorn(born)
        setLifeTotal(life)
        setLifeDeath(death)
    }, [age, start, time])

    useEffect(() => {
        if (!alter) return
        const abs = Math.abs(alter)
        if (abs < 1) setAltArrowCount(1)
        else if (abs > 5) setAltArrowCount(3)
        else setAltArrowCount(2)
    }, [alter])

    useEffect(() => {
        const getValue = (keys: (string | number)[]) => {
            switch (keys[0]) {
                case 'life':
                    switch (keys[1]) {
                        case 'born':
                            return lifeBorn
                        case 'death':
                            return lifeDeath
                        case 'total':
                            return lifeTotal
                    }
                    break
                case 'average':
                    switch (keys[1]) {
                        case 'country':
                            return averageCountry
                        case 'high':
                            return averageHigh
                    }
                    break
                case 'alt':
                    switch (keys[1]) {
                        case 'worst':
                            return altWorst
                        case 'best':
                            return altBest
                    }
                    break
                case 'question':
                    return selected[keys[1] as number]
                case 'random':
                    return getRandom(keys[1] as string)
            }
            return NaN
        }
        const achivements = []
        for (const achivement of query('achivement')) {
            if (check(achivement.condition, getValue)) {
                achivements.push(achivement)
            }
        }
        achivements.sort((a, b) => a.grade - b.grade)
        setAchivements(achivements)
    }, [
        lifeBorn,
        lifeDeath,
        lifeTotal,
        averageCountry,
        averageHigh,
        altWorst,
        altBest,
        selected,
    ])

    const onSelect = (select: number) => {
        const last = alter
        selected[cursor] = select
        const { alt, worst, best } = processAlt(
            base,
            selected.filter(a => a >= 0).map((s, i) => alts[i][s])
        )
        if (worst != altWorst) setAltWorst(worst)
        if (best != altBest) setAltBest(best)
        setAlter(alt)
        animate(
            scope.current,
            {
                scale: [1.1, 1],
                color: [alt - last > 0 ? '#90ee90' : '#ed8985', '#ffffff'],
            },
            {
                duration: 0.3,
                ease: 'easeInOut',
            }
        )
    }

    return (
        <div id="result">
            <div className="btn back" onClick={onBack}>
                <Back />
            </div>
            <div className="space-padding"></div>
            <div className="timer">
                <div className="title">{t('UI_COUNTDOWN')}</div>
                <div
                    className={'year ' + (alter > 0 ? 'add' : 'sub')}
                    ref={scope}
                >
                    <div className="time">
                        <span>{countdown.YY}</span>
                        <span>{t('UI_Y')}</span>
                    </div>
                    <div className="time">
                        <span>{countdown.MM}</span>
                        <span>{t('UI_M')}</span>
                    </div>
                    <div className="time">
                        <span>{countdown.DD}</span>
                        <span>{t('UI_D')}</span>
                    </div>
                    <Arrow
                        direction={alter > 0 ? 'up' : 'down'}
                        count={altArrowCount}
                    />
                </div>
                <div className="hms">{t('UI_HMS', countdown)}</div>
            </div>
            <ul className="achivements">
                {achivements.map(
                    ({ achivement, grade, tips }: Achivement, i: number) => (
                        <li
                            className={`btn grade${grade}`}
                            key={i}
                            onClick={() => toast(t(tips))}
                        >
                            <span>{t(achivement)}</span>
                        </li>
                    )
                )}
            </ul>
            <div className="question">
                <div className="title">{t('UI_QUESTION')}</div>
                <div className="content">
                    <div className="q">{t(questions[cursor]?.question)}</div>
                    <ul>
                        {questions[cursor]?.options.map((opt, i) => (
                            <li key={i}>
                                <input
                                    type="radio"
                                    id={`option${i}`}
                                    name={`question${cursor}`}
                                    value={opt}
                                    checked={selected[cursor] === i}
                                    onChange={e =>
                                        e.target.checked && onSelect(i)
                                    }
                                />
                                <label htmlFor={`option${i}`}>{t(opt)}</label>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="button-group">
                    {cursor === 0 ? (
                        <div className="btn disabled">{t('UI_PQ')}</div>
                    ) : (
                        <div
                            className="btn"
                            onClick={() => setCursor(cursor - 1)}
                        >
                            {t('UI_PQ')}
                        </div>
                    )}
                    {cursor === questions.length - 1 ? (
                        <div className="btn disabled">{t('UI_NQ')}</div>
                    ) : (
                        <div
                            className="btn"
                            onClick={() => {
                                setCursor(cursor + 1)
                            }}
                        >
                            {t('UI_NQ')}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
export default ResultPage
