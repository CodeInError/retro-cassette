import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <h1 className="text-5xl font-bold text-red-500">
        Hello World
      </h1>
    </div>
    </>
  )
}

export default App
