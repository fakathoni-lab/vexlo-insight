import { useTranslation } from 'react-i18next';

const langs = [
  { code: 'en', label: 'EN', flag: '🇺🇸' },
  { code: 'id', label: 'ID', flag: '🇮🇩' },
] as const;

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  return (
    <div className="flex items-center gap-1.5">
      {langs.map((lang) => {
        const isActive = i18n.language?.startsWith(lang.code);
        return (
          <button
            key={lang.code}
            onClick={() => i18n.changeLanguage(lang.code)}
            className="rounded-full px-2.5 py-1 text-xs font-mono transition-all duration-200"
            style={{
              backgroundColor: isActive ? 'hsl(263, 84%, 58%)' : 'transparent',
              color: isActive ? '#fff' : 'var(--text-dim)',
              border: isActive ? '1px solid transparent' : '1px solid var(--border-strong)',
            }}
          >
            {lang.flag} {lang.label}
          </button>
        );
      })}
    </div>
  );
};

export default LanguageSwitcher;
