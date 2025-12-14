

import { Button } from "../components/ui/button"
import { useLanguage } from "./language-provider"

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage()

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "hi" : "en")
  }

  return (
    <Button variant="outline" size="sm" onClick={toggleLanguage}>
      {language === "en" ? "हिं" : "EN"}
    </Button>
  )
}
