

import { createContext, useContext, useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import "../lib/i18n"




const LanguageContext = createContext(undefined)

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState("en")
  const { t, i18n } = useTranslation("common")

  useEffect(() => {
    // Load saved language from localStorage
    const savedLanguage = localStorage.getItem("salon-language") 
    if (savedLanguage && (savedLanguage === "en" || savedLanguage === "hi")) {
      setLanguageState(savedLanguage)
      i18n.changeLanguage(savedLanguage)
    }
  }, [i18n])

  const setLanguage = (lang) => {
    setLanguageState(lang)
    i18n.changeLanguage(lang)
    localStorage.setItem("salon-language", lang)
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
