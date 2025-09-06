import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App
        tableId={101010}
        width={500}
        height={300}
        backgroundColor="rgba(210,147,63,0.1)"
    />
  </StrictMode>,
)
