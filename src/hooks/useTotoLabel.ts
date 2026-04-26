/**
 * useTotoLabel — returns the right Toto word display text based on selected language.
 *
 * - language 'en' → returns the Latin/Roman Toto word (word.toto or word.english)
 * - language 'bn' → same as 'en' (Bengali UI but Toto words stay in Latin script)
 * - language 'tb' → returns the Toto word written in Bengali script (from TOTO_BENGALI map)
 */
import { useLanguage } from '@/contexts/LanguageContext';
import { getTotoBengali } from '@/data/totoBengali';

interface WordLike {
    english: string;
    toto?: string;
}

export function useTotoLabel() {
    const { language } = useLanguage();

    /**
     * Get the display label for a Toto word.
     * @param word - A word object with `.english` and optionally `.toto`
     * @returns the appropriate script string
     */
    const getTotoLabel = (word: WordLike): string => {
        if (language === 'tb') {
            return getTotoBengali(word.english, word.toto);
        }
        return word.toto || word.english;
    };

    /**
     * Get label from a plain English string (no word object).
     */
    const getLabelForEnglish = (english: string, latinToto?: string): string => {
        if (language === 'tb') {
            return getTotoBengali(english, latinToto);
        }
        return latinToto || english;
    };

    const isTotoBengali = language === 'tb';

    return { getTotoLabel, getLabelForEnglish, isTotoBengali };
}
