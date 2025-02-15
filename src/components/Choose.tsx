import { useLanguage } from '@/hooks'
import type { Base } from '@/data'
import './Choose.css'

export interface Props<T extends Base> {
    readonly list: T[]
    readonly onChoose?: (item: T) => void
    readonly onClose?: () => void
}
export function Choose<T extends Base>({ list, onChoose, onClose }: Props<T>) {
    const { t } = useLanguage()
    return (
        <div
            className="choose"
            onClick={e => {
                e.stopPropagation()
                onClose?.()
            }}
        >
            <ul>
                {list.map((item, i) => (
                    <li
                        key={i}
                        onClick={e => {
                            e.stopPropagation()
                            onChoose?.(item)
                        }}
                    >
                        <span>{t(item.value)}</span>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default Choose
