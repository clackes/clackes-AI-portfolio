import strings from './strings.json';
import { siteData } from './data/site';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type Lang = 'en' | 'it';

type Dict = Record<string, string>;

// The strings live in strings.json so the server (and Nexus) can read the defaults;
// edits made from Nexus arrive as overrides in window.__PORTFOLIO__.texts.
const dicts: Record<Lang, Dict> = strings as Record<Lang, Dict>;
const injected = siteData()?.texts;
const overrides: Record<Lang, Dict> = { en: injected?.en ?? {}, it: injected?.it ?? {} };


type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
};

const LangCtx = createContext<Ctx | null>(null);

const STORAGE_KEY = 'av_lang';

function detectInitial(): Lang {
  if (typeof window === 'undefined') return 'en';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'en' || stored === 'it') return stored;
  const nav = window.navigator.language?.toLowerCase() ?? '';
  return nav.startsWith('it') ? 'it' : 'en';
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => detectInitial());

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore quota / privacy errors */
    }
  }, []);

  const t = useCallback(
    (key: string) => overrides[lang]?.[key] || dicts[lang][key] || overrides.en?.[key] || dicts.en[key] || key,
    [lang],
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);
  return <LangCtx.Provider value={value}>{children}</LangCtx.Provider>;
}

export function useLang() {
  const ctx = useContext(LangCtx);
  if (!ctx) throw new Error('useLang must be used inside <LangProvider>');
  return ctx;
}

export function useT() {
  const ctx = useContext(LangCtx);
  return ctx ? ctx.t : (key: string) => key;
}
