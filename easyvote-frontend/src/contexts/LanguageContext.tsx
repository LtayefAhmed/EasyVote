import { createContext, useEffect, useState } from 'react';

interface LanguageContextType {
    language: string;
    setLanguage: (lang: string) => void;
}

export const LanguageContext = createContext<LanguageContextType>({
    language: localStorage.getItem("language") || "fr",
    setLanguage: () => { },
    
});

interface LanguageProviderProps {
    children: any;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
    const [language, setLanguage] = useState(localStorage.getItem("language") || "fr");
    useEffect(() => {
        localStorage.setItem("language", language);
    }, [language]);
    
    return (
        <LanguageContext.Provider value={{ language, setLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};