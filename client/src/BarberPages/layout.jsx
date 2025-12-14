
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { LanguageProvider } from "../components-barber/language-provider"
import { Suspense } from "react"

export const metadata = {
  title: "Salon Manager",
  description: "Professional salon management platform",
  generator: "v0.app",
}

export default function RootLayout({
  children
}) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={<div>Loading...</div>}>
          <LanguageProvider>{children}</LanguageProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
