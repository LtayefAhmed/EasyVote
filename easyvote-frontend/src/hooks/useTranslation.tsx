import { useContext } from 'react';

import en from '../i18n/locales/en.json';
import fr from '../i18n/locales/fr.json';
import { LanguageContext } from '@/contexts/LanguageContext';
const translations = { en, fr };

export const useTranslation = () => {
    const { language } = useContext(LanguageContext);

    const t = (key: string): string => {
        const keys = key.split('.');
        let result: any = translations[language as keyof typeof translations];
        for (const k of keys) {
            result = result[k] || k;
        }
        return result;
    };

    return { t, language };
};