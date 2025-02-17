import { init as initDatabase } from '@/database'
import { init as initData } from '@/data'
import { callNow } from '@/utils'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

callNow(async () => {
    console.log('Github repo https://github.com/VickScarlet/deadline')
    console.log('Code by VickScarlet https://github.com/VickScarlet')
    await initDatabase()
    await initData()
    createRoot(document.body).render(
        <StrictMode>
            <App />
        </StrictMode>
    )
})
