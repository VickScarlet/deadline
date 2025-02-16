import { data, version } from '@/data/data.json'
import { database } from '@/database'
import { zoneRandom, cdf } from '@/utils'

export { version }

export interface Base {
    value: string | number
}

export interface I18n {
    id: string
    lang: {
        [lang: string]: string
    }
}

export interface Country extends Base {
    value: string
    life: {
        male: number
        female: number
    }
}

export interface Age extends Base {
    value: number
}

export interface Sex extends Base {
    value: 'male' | 'female'
}

export interface Achivement {
    achivement: string
    grade: number
    tips: string
    condition: Rule
}

export interface AltNormal {
    type: 'normal'
    args: number
}

export interface AltRandom {
    type: 'random'
    args: [number, number]
}

export type Alts = AltNormal | AltRandom

export interface QuestionOption {
    opt: string
    alt: Alts
}
export interface Question {
    id: number
    question: string
    options: QuestionOption[]
}

export interface Random {
    id: string
    min: number
    max: number
}

export interface Config {
    [key: string]: {
        key: string
        value:
            | number
            | {
                  type: 'random'
                  args: [number, number]
              }
    }
}

export type Sheets =
    | I18n[]
    | Country[]
    | Age[]
    | Sex[]
    | Achivement[]
    | Question[]
    | Random[]
    | Config

export function query(key: 'i18n'): I18n[]
export function query(key: 'country'): Country[]
export function query(key: 'age'): Age[]
export function query(key: 'sex'): Sex[]
export function query(key: 'achivement'): Achivement[]
export function query(key: 'question'): Question[]
export function query(key: 'random'): Random[]
export function query(key: 'config'): Config
export function query(key: keyof typeof data) {
    return data[key] as Sheets
}
export default query

export interface Value {
    rule: 'value'
    args: (string | number)[]
}

export type Values = Value | string | number
export type NumberValue = Value | number

export interface Or {
    rule: 'or'
    args: Rule[]
}

export interface And {
    rule: 'and'
    args: Rule[]
}

export interface Not {
    rule: 'not'
    args: Rule
}

export interface Eq {
    rule: 'eq'
    args: [Values, Values]
}

export interface Gt {
    rule: 'gt'
    args: [NumberValue, NumberValue]
}

export interface Gte {
    rule: 'gte'
    args: [NumberValue, NumberValue]
}

export interface Lt {
    rule: 'lt'
    args: [NumberValue, NumberValue]
}

export interface Lte {
    rule: 'lte'
    args: [NumberValue, NumberValue]
}

export interface In {
    rule: 'in'
    args: [Values, Values[]]
}

export type Rule = Or | And | Not | Eq | Gt | Gte | Lt | Lte | In

export type GetValue = (key: Value['args']) => number | string

export function check(rule: Rule, getValue: GetValue): boolean {
    switch (rule.rule) {
        case 'not':
            return !check(rule.args, getValue)
        case 'or':
            for (const arg of rule.args) if (check(arg, getValue)) return true
            return false
        case 'and':
            for (const arg of rule.args) if (!check(arg, getValue)) return false
            return true
    }

    const v = (value: Values) => {
        if (typeof value !== 'object') return value
        return getValue(value.args)
    }
    switch (rule.rule) {
        case 'eq':
            return v(rule.args[0]) === v(rule.args[1])
        case 'gt':
            return v(rule.args[0]) > v(rule.args[1])
        case 'gte':
            return v(rule.args[0]) >= v(rule.args[1])
        case 'lt':
            return v(rule.args[0]) < v(rule.args[1])
        case 'lte':
            return v(rule.args[0]) <= v(rule.args[1])
        case 'in':
            return rule.args[1].map(a => v(a)).includes(v(rule.args[0]))
    }
    throw new Error(`Unknown rule: ${JSON.stringify(rule)}`)
}

async function getRandomMap() {
    const q = await database.get<{
        data: Map<string, number>
    }>('global', 'random')
    if (q) return q.data
    const data = new Map<string, number>()
    for (const { id, min, max } of query('random')) {
        data.set(id, zoneRandom(min, max))
    }
    await database.put('global', { key: 'random', data })
    return data
}

let random: Awaited<ReturnType<typeof getRandomMap>> | null = null

export async function init() {
    const q = await database.get('questions', version, 'version')
    if (!q) await database.clear('questions')
    random = await getRandomMap()
}

export function getRandom(key: string) {
    if (!random!.has(key)) throw new Error(`Unknown random key: ${key}`)
    return random!.get(key)!
}

interface AltsData {
    country: string
    age: number
    sex: string
    version: string
    data: number[][]
}

export async function getQuestions(country: Country, age: Age, sex: Sex) {
    const questions = query('question').map(({ question, options }) => ({
        question,
        options: options.map(({ opt }) => opt),
    }))
    const q = await database.get<AltsData>('questions', [
        country.value,
        age.value,
        sex.value,
        version,
    ])
    if (q) return { questions, alts: q.data }
    const alts = query('question').map(({ options }) =>
        options.map(({ alt }) => {
            switch (alt.type) {
                case 'normal':
                    return alt.args
                case 'random': {
                    return zoneRandom(...alt.args)
                }
            }
        })
    )
    database.put('questions', {
        country: country.value,
        age: age.value,
        sex: sex.value,
        version,
        data: alts,
    })
    return { questions, alts }
}

export function getConfig(key: string) {
    const d = query('config')[key]
    if (!d) throw new Error(`Unknown config key: ${key}`)
    const v = d.value
    if (typeof v !== 'object') return v
    switch (v.type) {
        case 'random':
            return zoneRandom(...v.args)
    }
}

export function processAlt(base: number, alts: number[]) {
    const add = alts.filter(a => a > 0)
    const sub = alts.filter(a => a < 0)

    let alt = 0
    let worst = Infinity
    let best = -Infinity
    const baseLine = getConfig('lifeBaseLine')
    const altDilution = getConfig('altDilution')

    for (const a of add) {
        alt += a
        if (a < worst) worst = a
        if (a > best) best = a
    }
    for (const a of sub) {
        let mAlt = a
        if (base + alt + a < baseLine) {
            if (base + alt > baseLine) {
                const mt = baseLine - base - alt
                mAlt = (a - mt) / altDilution + mt
            } else {
                mAlt = a / altDilution
            }
        }
        alt += mAlt
        if (mAlt < worst) worst = mAlt
        if (mAlt > best) best = mAlt
    }
    return { alt, worst, best }
}

export function getBaseLife(country: Country, age: Age, sex: Sex) {
    const sexValue = sex.value
    const ageValue = age.value
    const averageValue = country.life[sexValue]
    return ageValue >= averageValue
        ? getConfig('lifeBaseRandom')
        : averageValue - ageValue
}

export function getLifeSeconds(life: number) {
    return life * getConfig('year')
}

export function calcLife(seconds: number) {
    const YEAR = getConfig('year')
    const MONTH = getConfig('month')

    const Y = Math.floor(seconds / YEAR)
    const M = Math.floor((seconds - Y * YEAR) / MONTH)
    const D = Math.floor((seconds - Y * YEAR - M * MONTH) / 86400)
    const h = Math.floor((seconds / 3600) % 24)
    const m = Math.floor((seconds / 60) % 60)
    const s = Math.floor(seconds % 60)
    return { Y, M, D, h, m, s }
}

export function percentBefore(
    life: number,
    country: Country,
    age: Age,
    sex: Sex
) {
    const x = life + age.value
    const mean = country.life[sex.value]
    const std = getConfig('lifeStd')
    return (cdf(x, mean, std) * 100).toFixed(2).replace(/\.00$/, '')
}
