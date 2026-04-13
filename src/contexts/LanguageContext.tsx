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

    // Navigation (keep short for navbar)
    'nav.learn': 'Learn',
    'nav.journey': 'Map',
    'nav.play': 'Play',
    'nav.ranking': 'Rank',
    'nav.chatbot': 'Chat',
    'nav.profile': 'Me',

    // Learn Tab
    'learn.greeting.morning': 'Good morning',
    'learn.greeting.afternoon': 'Good afternoon',
    'learn.greeting.evening': 'Good evening',
    'learn.greeting.sub.morning': 'Ready to learn something new today?',
    'learn.greeting.sub.afternoon': "Let's pick up where you left off!",
    'learn.greeting.sub.evening': 'A perfect time for a quick session.',
    'learn.wordsMastered': 'Words mastered',
    'learn.todaysWords': "Today's Words",
    'learn.allCaughtUp': 'All caught up!',
    'learn.comeBackTomorrow': 'Come back tomorrow for new words.',
    'learn.swipeLeftSkip': 'Swipe left to skip',
    'learn.swipeRightLearn': 'Swipe right to learn',
    'learn.skip': 'Skip',
    'learn.learned': 'Learned',
    'learn.browseByCategory': 'Browse by Category',
    'learn.words': 'words',
    'learn.concepts': 'Concepts',
    'learn.slides': 'slides',
    'learn.done': 'Done',
    'learn.folkStories': 'Folk Stories',
    'learn.read': 'Read',
    'learn.new': 'New',
    'learn.totoTip': 'Toto Tip',
    'learn.tipText': 'Learn 5 new words to unlock games! Words you learn here will appear in quizzes and earn you coins.',

    // Play Tab
    'play.playZone': 'Play Zone',
    'play.chooseGame': 'Choose a game!',
    'play.puzzle': 'Puzzle Builder',
    'play.puzzleDesc': 'Piece together images!',
    'play.runner': 'Toto Runner',
    'play.runnerDesc': 'Run, jump & learn!',
    'play.treasure': 'Treasure Hunt',
    'play.treasureDesc': 'Find hidden objects!',
    'play.blocks': 'Block Builder',
    'play.blocksDesc': 'Build shapes & learn!',
    'play.wordfinder': 'Word Finder',
    'play.wordfinderDesc': 'Spot words in scenes!',
    'play.challenge': 'Quick Challenge',
    'play.challengeDesc': 'Race against time!',
    'play.monkey': 'Monkey Arrow',
    'play.monkeyDesc': 'Shoot the right word!',
    'play.mascot.1': "Let's play & learn!",
    'play.mascot.2': 'Pick a game, have fun!',
    'play.mascot.3': 'Ready for adventure?',
    'play.mascot.4': "Let's go, champion!",
    'play.mascot.5': 'Time to play!',

    // Leaderboard
    'leaderboard.title': 'Leaderboard',
    'leaderboard.whoLearning': "Who's learning the most?",
    'leaderboard.yourRank': 'Your Rank',
    'leaderboard.noRankings': 'No rankings yet!',
    'leaderboard.createAccount': 'Create an account and start learning to appear on the leaderboard.',
    'leaderboard.you': 'YOU',
    'leaderboard.coins': 'coins',
    'leaderboard.howItWorks': 'How Rankings Work',
    'leaderboard.rule1': 'Learn words to earn 5 coins each',
    'leaderboard.rule2': 'Complete concepts for 20 coins',
    'leaderboard.rule3': 'Win games for 50+ coins',
    'leaderboard.rule4': 'Perfect levels earn diamonds',

    // Map
    'map.masterToto': 'Master the Toto Language!',
    'map.explorer': 'Explorer',
    'map.level': 'Level',
    'map.locked': 'Locked',

    // Common
    'common.coinsToNext': 'coins to next',
    'common.deleteAccount': 'Delete this account?',
    'common.english': 'English',
    'common.toto': 'Toto',

    // Categories
    'category.Animals': 'Animals',
    'category.Food': 'Food',
    'category.Nature': 'Nature',
    'category.Body Parts': 'Body Parts',
    'category.Actions': 'Actions',
    'category.Emotions': 'Emotions',
    'category.Family': 'Family',
    'category.Places': 'Places',
    'category.Community': 'Community',

    // NudgeBar
    'nudge.welcome.title': "Welcome! Let's begin your Toto journey",
    'nudge.welcome.subtitle': 'Swipe through your first words below to get started.',
    'nudge.welcome.cta': 'Start Learning',
    'nudge.streak.week.title': '-day streak! You\'re unstoppable',
    'nudge.streak.week.subtitle': 'That\'s serious dedication. Keep the fire burning!',
    'nudge.streak.good.title': '-day streak! Keep it alive',
    'nudge.streak.good.subtitle': 'Consistency is the secret to fluency.',
    'nudge.streak.start.title': 'Day 1 of your new streak!',
    'nudge.streak.start.subtitle': 'Come back tomorrow to make it 2 days.',
    'nudge.continue': 'Continue',
    'nudge.continueLearning': 'Continue Learning',
    'nudge.learnMore': 'Learn More',
    'nudge.letsGo': "Let's Go",
    'nudge.explore': 'Explore',
    'nudge.reviseNow': 'Revise Now',
    'nudge.startChallenge': 'Start Challenge',
    'nudge.keepGoing': 'Keep Going',
    'nudge.quickSession': 'Quick Session',
    'nudge.learnNow': 'Learn Now',
    'nudge.concepts.title': 'concepts waiting for you',
    'nudge.concepts.subtitle': 'Explore science topics in Toto and English.',
    'nudge.concepts.cta': 'Explore Concepts',
    'nudge.progress.title': '% vocabulary unlocked',
    'nudge.morning.title': 'Morning is the best time to learn!',
    'nudge.morning.subtitle': 'Your brain is fresh — even 2 minutes will make a difference.',
    'nudge.afternoon.title': 'Afternoon boost — learn a word!',
    'nudge.afternoon.subtitle': 'A small break to grow your vocabulary.',
    'nudge.evening.title': 'Wind down with a quick word',
    'nudge.evening.subtitle': 'A calm evening session locks in today\'s learning.',
    'nudge.challenge.title': 'Quick 1-minute challenge?',
    'nudge.challenge.subtitle': 'Test yourself and earn bonus coins!',
    'nudge.unexplored.title': "You haven't explored {category} yet",
    'nudge.unexplored.subtitle': 'Discover new words in the {category} category!',
    'nudge.waiting.title': '{category} is waiting for you',
    'nudge.waiting.subtitle': '{count} words to discover!',
    'nudge.revise.title': 'Revise "{word}" to lock it in',
    'nudge.revise.subtitle': 'Spaced repetition is how your brain remembers.',
    'nudge.milestone.title': 'words learned! Amazing milestone',
    'nudge.milestone.subtitle.50': "You're practically a Toto speaker now!",
    'nudge.milestone.subtitle.other': 'more to the next milestone.',
    'nudge.yesterday.title': 'You learned {count} words recently. Let\'s beat that!',
    'nudge.yesterday.subtitle': 'Aim for {target} today and watch your progress grow.',
    'nudge.fact.toto.title': 'Did you know? Toto has fewer than 1,600 speakers',
    'nudge.fact.toto.subtitle': 'Every word you learn helps preserve this language!',
    'nudge.fact.brain.title': '5 words a day trains your brain',
    'nudge.fact.brain.subtitle': 'Studies show short daily sessions beat long weekly ones.',
    'nudge.fact.play.title': 'Try the Play Zone for a fun break',
    'nudge.fact.play.subtitle': '6 mini-games to test your skills and earn coins!',
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

    // Navigation (keep short for navbar)
    'nav.learn': 'শেখা',
    'nav.journey': 'ম্যাপ',
    'nav.play': 'খেলা',
    'nav.ranking': 'র‍্যাঙ্ক',
    'nav.chatbot': 'চ্যাট',
    'nav.profile': 'আমি',

    // Learn Tab
    'learn.greeting.morning': 'সুপ্রভাত',
    'learn.greeting.afternoon': 'শুভ অপরাহ্ন',
    'learn.greeting.evening': 'শুভ সন্ধ্যা',
    'learn.greeting.sub.morning': 'আজ নতুন কিছু শিখতে প্রস্তুত?',
    'learn.greeting.sub.afternoon': 'চলো যেখানে থেমেছিলে সেখান থেকে শুরু করি!',
    'learn.greeting.sub.evening': 'দ্রুত সেশনের জন্য উপযুক্ত সময়।',
    'learn.wordsMastered': 'শেখা শব্দ',
    'learn.todaysWords': 'আজকের শব্দ',
    'learn.allCaughtUp': 'সব শেষ!',
    'learn.comeBackTomorrow': 'নতুন শব্দের জন্য আগামীকাল আবার আসো।',
    'learn.swipeLeftSkip': 'বাদ দিতে বামে সোয়াইপ করো',
    'learn.swipeRightLearn': 'শিখতে ডানে সোয়াইপ করো',
    'learn.skip': 'বাদ দাও',
    'learn.learned': 'শেখা হয়েছে',
    'learn.browseByCategory': 'বিভাগ অনুসারে দেখুন',
    'learn.words': 'শব্দ',
    'learn.concepts': 'ধারণা',
    'learn.slides': 'স্লাইড',
    'learn.done': 'সম্পন্ন',
    'learn.folkStories': 'লোককাহিনী',
    'learn.read': 'পড়া হয়েছে',
    'learn.new': 'নতুন',
    'learn.totoTip': 'টোটো টিপ',
    'learn.tipText': 'গেম আনলক করতে ৫টি নতুন শব্দ শিখো! এখানে শেখা শব্দগুলো কুইজে আসবে এবং কয়েন পাবে।',

    // Play Tab
    'play.playZone': 'খেলার জায়গা',
    'play.chooseGame': 'একটি গেম বেছে নাও!',
    'play.puzzle': 'পাজল বিল্ডার',
    'play.puzzleDesc': 'ছবি জোড়া দাও!',
    'play.runner': 'টোটো রানার',
    'play.runnerDesc': 'দৌড়াও, লাফাও ও শেখো!',
    'play.treasure': 'ট্রেজার হান্ট',
    'play.treasureDesc': 'লুকানো জিনিস খোঁজো!',
    'play.blocks': 'ব্লক বিল্ডার',
    'play.blocksDesc': 'আকৃতি বানাও ও শেখো!',
    'play.wordfinder': 'শব্দ খোঁজা',
    'play.wordfinderDesc': 'দৃশ্যে শব্দ খোঁজো!',
    'play.challenge': 'দ্রুত চ্যালেঞ্জ',
    'play.challengeDesc': 'সময়ের সাথে প্রতিযোগিতা!',
    'play.monkey': 'বানর তীর',
    'play.monkeyDesc': 'সঠিক শব্দে গুলি করো!',
    'play.mascot.1': 'চলো খেলি ও শিখি!',
    'play.mascot.2': 'একটি গেম বেছে নাও, মজা করো!',
    'play.mascot.3': 'অভিযানের জন্য প্রস্তুত?',
    'play.mascot.4': 'চলো, চ্যাম্পিয়ন!',
    'play.mascot.5': 'খেলার সময়!',

    // Leaderboard
    'leaderboard.title': 'লিডারবোর্ড',
    'leaderboard.whoLearning': 'কে সবচেয়ে বেশি শিখছে?',
    'leaderboard.yourRank': 'তোমার র‍্যাঙ্ক',
    'leaderboard.noRankings': 'এখনো কোনো র‍্যাঙ্কিং নেই!',
    'leaderboard.createAccount': 'লিডারবোর্ডে আসতে একটি অ্যাকাউন্ট তৈরি করো এবং শেখা শুরু করো।',
    'leaderboard.you': 'তুমি',
    'leaderboard.coins': 'কয়েন',
    'leaderboard.howItWorks': 'র‍্যাঙ্কিং কিভাবে কাজ করে',
    'leaderboard.rule1': 'শব্দ শিখলে প্রতিটিতে ৫ কয়েন',
    'leaderboard.rule2': 'ধারণা সম্পন্ন করলে ২০ কয়েন',
    'leaderboard.rule3': 'গেম জিতলে ৫০+ কয়েন',
    'leaderboard.rule4': 'পারফেক্ট লেভেলে ডায়মন্ড',

    // Map
    'map.masterToto': 'টোটো ভাষায় মাস্টার হও!',
    'map.explorer': 'অভিযাত্রী',
    'map.level': 'লেভেল',
    'map.locked': 'লক করা',

    // Common
    'common.coinsToNext': 'কয়েন পরবর্তী লেভেলে',
    'common.deleteAccount': 'এই অ্যাকাউন্ট মুছে ফেলবে?',
    'common.english': 'ইংরেজি',
    'common.toto': 'টোটো',

    // Categories
    'category.Animals': 'প্রাণী',
    'category.Food': 'খাবার',
    'category.Nature': 'প্রকৃতি',
    'category.Body Parts': 'শরীরের অঙ্গ',
    'category.Actions': 'ক্রিয়া',
    'category.Emotions': 'আবেগ',
    'category.Family': 'পরিবার',
    'category.Places': 'স্থান',
    'category.Community': 'সম্প্রদায়',

    // NudgeBar
    'nudge.welcome.title': 'স্বাগতম! চলো টোটো যাত্রা শুরু করি',
    'nudge.welcome.subtitle': 'শুরু করতে নিচে তোমার প্রথম শব্দগুলো সোয়াইপ করো।',
    'nudge.welcome.cta': 'শেখা শুরু করো',
    'nudge.streak.week.title': '-দিনের স্ট্রিক! তুমি অপ্রতিরোধ্য',
    'nudge.streak.week.subtitle': 'এটা সত্যিকারের উৎসর্গ। আগুন জ্বালিয়ে রাখো!',
    'nudge.streak.good.title': '-দিনের স্ট্রিক! এটা বজায় রাখো',
    'nudge.streak.good.subtitle': 'ধারাবাহিকতা সাবলীলতার গোপন রহস্য।',
    'nudge.streak.start.title': 'তোমার নতুন স্ট্রিকের ১ম দিন!',
    'nudge.streak.start.subtitle': '২ দিন করতে আগামীকাল আবার এসো।',
    'nudge.continue': 'চালিয়ে যাও',
    'nudge.continueLearning': 'শেখা চালিয়ে যাও',
    'nudge.learnMore': 'আরো শেখো',
    'nudge.letsGo': 'চলো যাই',
    'nudge.explore': 'অন্বেষণ করো',
    'nudge.reviseNow': 'এখনই রিভিউ করো',
    'nudge.startChallenge': 'চ্যালেঞ্জ শুরু করো',
    'nudge.keepGoing': 'চালিয়ে যাও',
    'nudge.quickSession': 'দ্রুত সেশন',
    'nudge.learnNow': 'এখনই শেখো',
    'nudge.concepts.title': 'টি ধারণা তোমার জন্য অপেক্ষা করছে',
    'nudge.concepts.subtitle': 'টোটো ও ইংরেজিতে বিজ্ঞান বিষয় অন্বেষণ করো।',
    'nudge.concepts.cta': 'ধারণা অন্বেষণ করো',
    'nudge.progress.title': '% শব্দভাণ্ডার আনলক হয়েছে',
    'nudge.morning.title': 'সকাল শেখার সেরা সময়!',
    'nudge.morning.subtitle': 'তোমার মস্তিষ্ক তাজা — ২ মিনিটও পার্থক্য করবে।',
    'nudge.afternoon.title': 'বিকেলের বুস্ট — একটি শব্দ শেখো!',
    'nudge.afternoon.subtitle': 'শব্দভাণ্ডার বাড়াতে ছোট বিরতি।',
    'nudge.evening.title': 'একটি দ্রুত শব্দ দিয়ে দিন শেষ করো',
    'nudge.evening.subtitle': 'শান্ত সন্ধ্যার সেশন আজকের শেখা মনে রাখে।',
    'nudge.challenge.title': 'দ্রুত ১-মিনিটের চ্যালেঞ্জ?',
    'nudge.challenge.subtitle': 'নিজেকে পরীক্ষা করো এবং বোনাস কয়েন জিতো!',
    'nudge.unexplored.title': 'তুমি এখনো {category} অন্বেষণ করোনি',
    'nudge.unexplored.subtitle': '{category} বিভাগে নতুন শব্দ আবিষ্কার করো!',
    'nudge.waiting.title': '{category} তোমার জন্য অপেক্ষা করছে',
    'nudge.waiting.subtitle': '{count}টি শব্দ আবিষ্কার করতে হবে!',
    'nudge.revise.title': '"{word}" রিভিউ করে মনে রাখো',
    'nudge.revise.subtitle': 'স্পেসড রিপিটিশন তোমার মস্তিষ্ক মনে রাখে।',
    'nudge.milestone.title': 'টি শব্দ শেখা হয়েছে! দারুণ মাইলস্টোন',
    'nudge.milestone.subtitle.50': 'তুমি এখন প্রায় একজন টোটো ভাষী!',
    'nudge.milestone.subtitle.other': 'আরো পরবর্তী মাইলস্টোনে।',
    'nudge.yesterday.title': 'তুমি সম্প্রতি {count}টি শব্দ শিখেছো। চলো এটা পেরোই!',
    'nudge.yesterday.subtitle': 'আজ {target}টি লক্ষ্য রাখো এবং অগ্রগতি দেখো।',
    'nudge.fact.toto.title': 'জানো কি? টোটোতে ১,৬০০ এরও কম ভাষী আছে',
    'nudge.fact.toto.subtitle': 'তুমি যে প্রতিটি শব্দ শেখো তা এই ভাষা সংরক্ষণে সাহায্য করে!',
    'nudge.fact.brain.title': 'দিনে ৫টি শব্দ তোমার মস্তিষ্ককে প্রশিক্ষণ দেয়',
    'nudge.fact.brain.subtitle': 'গবেষণায় দেখা গেছে ছোট দৈনিক সেশন দীর্ঘ সাপ্তাহিক সেশনকে হারায়।',
    'nudge.fact.play.title': 'মজার বিরতির জন্য প্লে জোন চেষ্টা করো',
    'nudge.fact.play.subtitle': 'তোমার দক্ষতা পরীক্ষা করতে এবং কয়েন জিততে ৬টি মিনি-গেম!',
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
