import { useState } from 'react'
import { query } from '@/data'

const i18n = new Map()
for (const { id: key, lang: langs } of query('i18n')) {
    for (const [lang, value] of Object.entries(langs)) {
        if (!i18n.has(lang)) i18n.set(lang, new Map())
        i18n.get(lang)?.set(key, value)
    }
}

export const languages = Array.from(i18n.keys())
export interface FormatData {
    [key: string]: string | number
}
function format(template: string, formatData: FormatData) {
    return template.replace(/\{([^{}]+)\}/g, (match, key) => {
        return (formatData[key.trim()] as string) || match
    })
}

function getLanguageFallback() {
    const setting = localStorage.getItem('language')
    if (setting && i18n.has(setting)) return setting
    const nav = navigator.language
    if (nav) {
        if (i18n.has(nav)) return nav
        const lang = nav.split('-')[0]
        if (i18n.has(lang)) return lang
    }
    return 'en'
}
function saveLanguage(language: string) {
    localStorage.setItem('language', language)
    return language
}

export function useLanguage() {
    const [language, setLanguage] = useState(getLanguageFallback())
    return {
        t: (key: string | number, formatData?: FormatData) => {
            const template = i18n?.get(language)?.get(key) || key
            if (typeof template !== 'string')
                return template as unknown as string
            if (!formatData) return template
            return format(template, formatData)
        },
        setLanguage: (lang: string) => {
            setLanguage(saveLanguage(lang))
        },
    }
}

export default useLanguage
