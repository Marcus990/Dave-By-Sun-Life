import { FC, ReactNode } from 'react'
import './globals.css'
import { Inter } from 'next/font/google'
import Header from '@/components/Header'

const inter = Inter({ subsets: ['latin'] })

interface RootLayoutProps {
  children: ReactNode
}

const RootLayout: FC<RootLayoutProps> = ({ children }) => {
  return (
    <html lang="en">
      <head>
        <title>Marcus Ng | ETFs Portfolio</title>
        <meta name="description" content="ETFs Portfolio Dashboard by Marcus Ng" />
      </head>
      <body className={`${inter.className} bg-black`}>
        <Header />
        {children}
      </body>
    </html>
  )
}

export default RootLayout
