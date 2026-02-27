import { createContext, useState } from 'react';
import { en } from './en';
import { id } from './id';

export type Lang = 'en' | 'id';

export const translations = { en, id };

export type LanguageContextType = {
  lang: Lang;
  t: typeof translations[Lang];
  setLang: (lang: Lang) => void;
};

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  t: translations['en'],
  setLang: () => {},
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    return (localStorage.getItem('vexlo-lang') as Lang) || 'en';
  });

  const setLang = (lng: Lang) => {
    setLangState(lng);
    localStorage.setItem('vexlo-lang', lng);
  };

  return (
    <LanguageContext.Provider value={{ lang, t: translations[lang], setLang }}>
      {children}
    </LanguageContext.Provider>
  );
};

export { LanguageContext };
