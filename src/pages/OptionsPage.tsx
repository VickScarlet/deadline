import { useState, useEffect } from 'react'
import { useLanguage } from '@/hooks'
import { query, type Country, type Age, type Sex, type Base } from '@/data'
import { Choose } from '@/components/Choose'
import { type Options } from './ResultPage'
import { toast } from 'react-toastify'
import I18n from '@/assets/i18n.svg?react'
import Global from '@/assets/global.svg?react'
import Hourglass from '@/assets/hourglass.svg?react'
import Gender from '@/assets/gender.svg?react'
import Info from '@/assets/info.svg?react'
import './OptionsPage.css'

export interface OptionPageProps {
    onStart?: (options: Options) => void
}

interface Language extends Base {
    value: string
}

interface Choosed<T extends Base> {
    choosed: true
    value: T['value']
    item: T
}

interface UnChoosed {
    choosed: false
    value: string
}

type ChooseResult<T extends Base> = Choosed<T> | UnChoosed

export function OptionPage({ onStart }: OptionPageProps) {
    const { t, setLanguage, languages: langs } = useLanguage()
    const [countrys, setCountrys] = useState<Country[]>([])
    const [ages, setAges] = useState<Age[]>([])
    const [sexs, setSexs] = useState<Sex[]>([])
    const [languages, setLanguages] = useState<Language[]>([])
    useEffect(() => {
        setCountrys(query('country'))
        setAges(query('age'))
        setSexs(query('sex'))
    }, [])

    useEffect(() => {
        setLanguages(langs.map(value => ({ value })))
    }, [langs])

    const [country, setCountry] = useState<ChooseResult<Country>>({
        value: 'UI_C/R',
        choosed: false,
    })
    const [age, setAge] = useState<ChooseResult<Age>>({
        value: 'UI_AGE',
        choosed: false,
    })
    const [sex, setSex] = useState<ChooseResult<Sex>>({
        value: 'UI_SEX',
        choosed: false,
    })
    const [choose, setChoose] = useState('')

    const onChooseClose = () => setChoose('')

    const renderChoose = () => {
        switch (choose) {
            case 'country':
                return (
                    <Choose
                        list={countrys}
                        onChoose={item => {
                            setCountry({
                                item,
                                value: item.value,
                                choosed: true,
                            })
                            setChoose('')
                        }}
                        onClose={onChooseClose}
                    />
                )
            case 'age':
                return (
                    <Choose
                        list={ages}
                        onChoose={item => {
                            setAge({
                                item,
                                value: item.value,
                                choosed: true,
                            })
                            setChoose('')
                        }}
                        onClose={onChooseClose}
                    />
                )
            case 'gender':
                return (
                    <Choose
                        list={sexs}
                        onChoose={item => {
                            setSex({
                                item,
                                value: item.value,
                                choosed: true,
                            })
                            setChoose('')
                        }}
                        onClose={onChooseClose}
                    />
                )
            case 'language':
                return (
                    <Choose
                        list={languages}
                        onChoose={item => {
                            setLanguage(item.value)
                            setChoose('')
                        }}
                        onClose={onChooseClose}
                    />
                )
            default:
                return <></>
        }
    }
    const clickStart = () => {
        if (!country.choosed || !age.choosed || !sex.choosed) {
            toast.warn(t('UI_OPTIONS_TIPS'))
            return
        }
        const options = {
            country: country.item,
            age: age.item,
            sex: sex.item,
            start: Date.now(),
        }
        onStart?.(options)
    }

    return (
        <div id="options">
            <div className="language btn" onClick={() => setChoose('language')}>
                <I18n />
                <span>{t('UI_LANGUAGE')}</span>
            </div>
            <div>
                <h1 className="title">{t('UI_TITLE')}</h1>
                <h4 className="sub-title">{t('UI_SUB_TITLE')}</h4>
            </div>
            <div className="options">
                <div className="btn" onClick={() => setChoose('country')}>
                    <Global />
                    <span>{t(country.value)}</span>
                </div>
                <div className="btn" onClick={() => setChoose('age')}>
                    <Hourglass />
                    <span>{t(age.value)}</span>
                </div>
                <div className="btn" onClick={() => setChoose('gender')}>
                    <Gender />
                    <span>{t(sex.value)}</span>
                </div>
            </div>
            <div>
                <div className="btn" onClick={clickStart}>
                    <span>{t('UI_START')}</span>
                </div>
            </div>
            <div
                className="source iconbtn"
                onClick={() => {
                    toast(
                        <div>
                            <b>{t('UI_SOURCE')}</b>
                            <p>{t('UI_SOURCE_FROM')}</p>
                        </div>
                    )
                }}
            >
                <Info />
            </div>
            {renderChoose()}
        </div>
    )
}

export default OptionPage
