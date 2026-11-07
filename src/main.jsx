import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { LangProvider } from './i18n.jsx'
import './index.css'
import './tailwind.css'
import './theme.css'
import './redesign.css'
import './styles/shell.css'

createRoot(document.getElementById('root')).render(
  <LangProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </LangProvider>,
)
