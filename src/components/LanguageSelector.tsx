import { useLanguage, Language } from '@/contexts/LanguageContext';
import { Globe, Check } from 'lucide-react';

interface LanguageSelectorProps {
  variant?: 'card' | 'compact';
  showTitle?: boolean;
  onSelect?: () => void;
}

const languages: { code: Language; name: string; nativeName: string; flag: string; desc?: string }[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
  {
    code: 'tb',
    name: 'Toto in Bengali Script',
    nativeName: 'টোটো ভাষা · Toto Language',
    flag: '🧒',
    desc: 'বাংলা লিপিতে টোটো শব্দ · Toto words in Bengali script',
  },
];

export function LanguageSelector({ variant = 'card', showTitle = true, onSelect }: LanguageSelectorProps) {
  const { language, setLanguage, t } = useLanguage();

  const handleSelect = (code: Language) => {
    setLanguage(code);
    onSelect?.();
  };

  if (variant === 'compact') {
    return (
      <div className="flex gap-2">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleSelect(lang.code)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${language === lang.code
              ? 'bg-game-primary text-white shadow-md'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            <span className="text-lg">{lang.flag}</span>
            <span className="font-semibold text-sm">{lang.nativeName}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      {showTitle && (
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-game-primary/10 mb-4">
            <Globe className="w-8 h-8 text-game-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">{t('lang.title')}</h2>
          <p className="text-muted-foreground">{t('lang.subtitle')}</p>
        </div>
      )}

      <div className="space-y-3">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleSelect(lang.code)}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${language === lang.code
              ? 'bg-game-primary/10 ring-2 ring-game-primary'
              : 'bg-white hover:bg-gray-50 shadow-sm'
              }`}
          >
            <span className="text-3xl">{lang.flag}</span>
            <div className="flex-1 text-left">
              <p className="font-bold text-base">{lang.nativeName}</p>
              <p className="text-sm text-muted-foreground">{lang.desc ?? lang.name}</p>
            </div>
            {language === lang.code && (
              <div className="w-8 h-8 rounded-full bg-game-primary flex items-center justify-center">
                <Check className="w-5 h-5 text-white" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
