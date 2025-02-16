import { useState } from 'react'
import { ToastContainer } from 'react-toastify'
import { OptionPage } from '@/pages/OptionsPage'
import { ResultPage, type Options } from '@/pages/ResultPage'
import './App.css'

export default function App() {
    const [options, setOptions] = useState<null | Options>(null)
    return (
        <div id="app">
            {options ? (
                <ResultPage options={options} onBack={() => setOptions(null)} />
            ) : (
                <OptionPage onStart={options => setOptions(options)} />
            )}
            <ToastContainer theme="dark" position="top-center" />
        </div>
    )
}
