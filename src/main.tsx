import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import nmLogoUrl from './assets/nm.svg'
import './index.css'

const existingFavicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null
const favicon = existingFavicon ?? document.createElement('link')
favicon.rel = 'icon'
favicon.type = 'image/svg+xml'
favicon.href = nmLogoUrl
favicon.setAttribute('sizes', 'any')
if (!existingFavicon) document.head.appendChild(favicon)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
