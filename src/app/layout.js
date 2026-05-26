import { Playfair_Display, IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
  weight: ['400', '500', '700', '900'],
  style: ['normal', 'italic'],
})

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
})

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500'],
})

export const metadata = {
  title: 'Levelshift Intelligence',
  description: 'Your team briefing — curated, summarised, and ready to listen.',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${playfair.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable}`}>
        {/* Runs before React hydrates — prevents light-mode flash */}
        <script dangerouslySetInnerHTML={{
          __html: `(function(){try{var t=localStorage.getItem('ls-theme')||'dark';document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`
        }} />
        {children}
      </body>
    </html>
  )
}