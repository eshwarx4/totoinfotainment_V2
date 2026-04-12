import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'bn';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

const STORAGE_KEY = 'toto_app_language';

// Translations
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Welcome & Onboarding
    'welcome.title': 'Toto Infotainment',
    'welcome.subtitle': 'Learn the Toto language through fun games!',
    'welcome.tagline': 'An endangered language preservation project',
    'welcome.letsGo': "Let's Go!",
    'welcome.back': 'Welcome back!',
    'welcome.newAccount': '+ New Account',
    'welcome.whatsYourName': "What's your name?",
    'welcome.enterName': 'Enter your name...',
    'welcome.startAdventure': 'Start Adventure!',
    'welcome.backToAccounts': 'Back to accounts',

    // Language Selection
    'lang.title': 'Choose Language',
    'lang.subtitle': 'Select your preferred app language',
    'lang.english': 'English',
    'lang.bengali': 'Bengali',

    // Profile Setup
    'profile.iAmA': 'I am a...',
    'profile.personalizeExp': 'This helps us personalize your experience',
    'profile.student': 'Student',
    'profile.studentDesc': 'I want to learn!',
    'profile.teacher': 'Teacher',
    'profile.teacherDesc': 'I want to teach!',
    'profile.pickBuddy': 'Pick your buddy!',
    'profile.chooseBuddy': 'Choose a companion for your journey',
    'profile.next': 'Next',
    'profile.back': 'Back',

    // Profile Tab
    'profileTab.level': 'Level',
    'profileTab.coins': 'Coins',
    'profileTab.diamonds': 'Diamonds',
    'profileTab.streak': 'Streak',
    'profileTab.yourProgress': 'Your Progress',
    'profileTab.wordsLearned': 'Words Learned',
    'profileTab.storiesDone': 'Stories Done',
    'profileTab.levelsDone': 'Levels Done',
    'profileTab.worldsDone': 'Worlds Done',
    'profileTab.detailedProgress': 'Detailed Progress',
    'profileTab.settings': 'Settings',
    'profileTab.language': 'Language',
    'profileTab.switchAccount': 'Switch Account / Logout',
    'profileTab.rank': 'Rank',

    // Settings
    'settings.title': 'Settings',
    'settings.appLanguage': 'App Language',
    'settings.changeLanguage': 'Change app language',

    // Navigation
    'nav.learn': 'Learn',
    'nav.journey': 'Journey',
    'nav.play': 'Play',
    'nav.ranking': 'Ranking',
    'nav.chatbot': 'Chatbot',
    'nav.profile': 'Profile',

    // Common
    'common.coinsToNext': 'coins to next',
    'common.deleteAccount': 'Delete this account?',
  },
  bn: {
    // Welcome & Onboarding
    'welcome.title': 'টোটো ইনফোটেইনমেন্ট',
    'welcome.subtitle': 'মজার গেমের মাধ্যমে টোটো ভাষা শিখুন!',
    'welcome.tagline': 'একটি বিপন্ন ভাষা সংরক্ষণ প্রকল্প',
    'welcome.letsGo': 'চলো শুরু করি!',
    'welcome.back': 'আবার স্বাগতম!',
    'welcome.newAccount': '+ নতুন অ্যাকাউন্ট',
    'welcome.whatsYourName': 'তোমার নাম কি?',
    'welcome.enterName': 'তোমার নাম লেখো...',
    'welcome.startAdventure': 'অভিযান শুরু করো!',
    'welcome.backToAccounts': 'অ্যাকাউন্টে ফিরে যাও',

    // Language Selection
    'lang.title': 'ভাষা নির্বাচন করো',
    'lang.subtitle': 'তোমার পছন্দের অ্যাপ ভাষা নির্বাচন করো',
    'lang.english': 'ইংরেজি',
    'lang.bengali': 'বাংলা',

    // Profile Setup
    'profile.iAmA': 'আমি একজন...',
    'profile.personalizeExp': 'এটি আমাদের তোমার অভিজ্ঞতা কাস্টমাইজ করতে সাহায্য করে',
    'profile.student': 'শিক্ষার্থী',
    'profile.studentDesc': 'আমি শিখতে চাই!',
    'profile.teacher': 'শিক্ষক',
    'profile.teacherDesc': 'আমি শেখাতে চাই!',
    'profile.pickBuddy': 'তোমার বন্ধু বেছে নাও!',
    'profile.chooseBuddy': 'তোমার যাত্রার জন্য একটি সঙ্গী বেছে নাও',
    'profile.next': 'পরবর্তী',
    'profile.back': 'পিছনে',

    // Profile Tab
    'profileTab.level': 'লেভেল',
    'profileTab.coins': 'কয়েন',
    'profileTab.diamonds': 'ডায়মন্ড',
    'profileTab.streak': 'স্ট্রিক',
    'profileTab.yourProgress': 'তোমার অগ্রগতি',
    'profileTab.wordsLearned': 'শেখা শব্দ',
    'profileTab.storiesDone': 'সম্পন্ন গল্প',
    'profileTab.levelsDone': 'সম্পন্ন লেভেল',
    'profileTab.worldsDone': 'সম্পন্ন ওয়ার্ল্ড',
    'profileTab.detailedProgress': 'বিস্তারিত অগ্রগতি',
    'profileTab.settings': 'সেটিংস',
    'profileTab.language': 'ভাষা',
    'profileTab.switchAccount': 'অ্যাকাউন্ট পরিবর্তন / লগআউট',
    'profileTab.rank': 'র‍্যাঙ্ক',

    // Settings
    'settings.title': 'সেটিংস',
    'settings.appLanguage': 'অ্যাপের ভাষা',
    'settings.changeLanguage': 'অ্যাপের ভাষা পরিবর্তন করো',

    // Navigation
    'nav.learn': 'শেখো',
    'nav.journey': 'যাত্রা',
    'nav.play': 'খেলো',
    'nav.ranking': 'র‍্যাঙ্কিং',
    'nav.chatbot': 'চ্যাটবট',
    'nav.profile': 'প্রোফাইল',

    // Common
    'common.coinsToNext': 'কয়েন পরবর্তী লেভেলে',
    'common.deleteAccount': 'এই অ্যাকাউন্ট মুছে ফেলবে?',
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return (saved as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
