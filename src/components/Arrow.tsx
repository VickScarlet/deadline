import UpArrow from '@/assets/up-arrow.svg?react'
import './Arrow.css'

export type Direction = 'up' | 'down' | 'left' | 'right'
export interface ArrowProps {
    direction: Direction
    count: number
}

export function Arrow({ direction, count }: ArrowProps) {
    return (
        <div className={'arrow ' + direction}>
            <ul>
                {count ? (
                    new Array(count + 1).fill(0).map((_, i) => (
                        <li key={i}>
                            <UpArrow />
                        </li>
                    ))
                ) : (
                    <></>
                )}
            </ul>
        </div>
    )
}
