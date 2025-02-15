import { useState, useEffect } from 'react'
import { query } from '@/data'

type MapData = Map<string, Map<string | number, string>>
export interface FormatData {
    [key: string]: string | number
}
function format(template: string, formatData: FormatData) {
    return template.replace(/\{([^{}]+)\}/g, (match, key) => {
        return (formatData[key] as string) || match
    })
}

function getLanguageFallback() {
    const fallback = []
    const userSettings = localStorage.getItem('language')
    if (userSettings) fallback.push(userSettings)
    const nav = navigator.language
    if (nav) {
        fallback.push(nav)
        fallback.push(nav.split('-')[0])
    }
    fallback.push('en')
    return fallback
}

export function useLanguage() {
    const [language, setLanguage] = useState('')
    const [i18n, setI18n] = useState<MapData | null>(null)
    const [languages, setLanguages] = useState<string[]>([])
    useEffect(() => {
        const i18n = new Map()
        for (const { id: key, lang: langs } of query('i18n')) {
            for (const [lang, value] of Object.entries(langs)) {
                if (!i18n.has(lang)) i18n.set(lang, new Map())
                i18n.get(lang)?.set(key, value)
            }
        }
        setI18n(i18n)
        setLanguages(Array.from(i18n.keys()))
        const fallback = getLanguageFallback()
        for (const lang of fallback) {
            if (i18n.has(lang)) {
                setLanguage(lang)
                return
            }
        }
    }, [])
    return {
        t: (key: string | number, formatData?: FormatData) => {
            const template = i18n?.get(language)?.get(key) || key
            if (typeof template !== 'string')
                return template as unknown as string
            if (!formatData) return template
            return format(template, formatData)
        },
        setLanguage: (lang: string) => {
            localStorage.setItem('language', lang)
            setLanguage(lang)
        },
        languages,
    }
}

export default useLanguage
