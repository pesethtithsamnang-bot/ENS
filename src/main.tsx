import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/App'
import './index.css'

// A visible deterrent, not a real security control - it can't stop
// anything on its own, but it puts on record that unauthorized access
// attempts (scraping, credential attacks, tampering with requests) are not
// permitted and may be pursued. Actual protection is Cloudflare's WAF/rate
// limiting and Supabase RLS on the backend, not this message.
console.log(
  '%cStop.',
  'color:#e1152b; font-size:48px; font-weight:900; font-family:sans-serif;',
)
console.log(
  '%cThis console is for developers. If someone told you to paste something here, it is very likely an attempt to compromise your account - do not paste anything you do not fully understand.\n\nUnauthorized access, scraping, or attempts to interfere with this site or its users\' accounts are not permitted and may result in legal action.',
  'color:#3c3c40; font-size:14px; font-family:sans-serif; line-height:1.5;',
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
