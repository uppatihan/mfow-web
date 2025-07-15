import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  // <StrictMode> //เปิด command ถ้าอยากให้ fetch data 2 ครั้ง
    <App />
  //</StrictMode>,
)
