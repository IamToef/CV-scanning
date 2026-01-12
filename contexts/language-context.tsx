"use client"

import React, { createContext, useContext, useEffect, useState } from "react";
import { dictionary, Locale } from "@/lib/dictionaries";

type LanguageContextType = {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: keyof typeof dictionary['en']) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>('en');

    useEffect(() => {
        // Load persisted language
        const saved = localStorage.getItem('recruitpro-locale') as Locale;
        if (saved && (saved === 'en' || saved === 'vi')) {
            setLocaleState(saved);
        }
    }, []);

    const setLocale = (newLocale: Locale) => {
        setLocaleState(newLocale);
        localStorage.setItem('recruitpro-locale', newLocale);
    };

    const t = (key: keyof typeof dictionary['en']) => {
        return dictionary[locale][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ locale, setLocale, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}
