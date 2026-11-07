import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { LANGS, translate } from './data/translations.js'
import { setPageLanguage } from './lib/pageTranslate.js'

const KEY = 'srm-lang'
const Ctx = createContext({ lang: 'en', setLang: () => {}, t: (s) => s })

const initial = () => {
  try {
    const v = localStorage.getItem(KEY)
    return LANGS.some((l) => l[0] === v) ? v : 'en'
  } catch {
    return 'en'
  }
}

/** Holds the chosen language (English, Tamil or Hindi), remembers it on this device and sets <html lang>. */
export function LangProvider({ children }) {
  const [lang, set] = useState(initial)
  useEffect(() => {
    document.documentElement.setAttribute('lang', lang)
    // everything the hand-made dictionary does not cover is translated in the page itself (see lib/pageTranslate.js)
    setPageLanguage(lang)
  }, [lang])
  const setLang = useCallback((l) => {
    if (!LANGS.some((x) => x[0] === l)) return
    set(l)
    try {
      localStorage.setItem(KEY, l)
    } catch {
      /* storage blocked: the choice lasts until the page is closed */
    }
  }, [])
  const t = useCallback((text) => translate(lang, text), [lang])
  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useLang = () => useContext(Ctx)
