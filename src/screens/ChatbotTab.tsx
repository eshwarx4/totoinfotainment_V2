import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Volume2, VolumeX, BookOpen, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// ==========================================
// HARDCODED TOTO STORIES (English + Bengali)
// ==========================================
const TOTO_STORIES = [
  {
    title: { en: 'The Brave Toto Boy', bn: 'সাহসী টোটো ছেলে' },
    emoji: '🐯',
    story: {
      en: `Once upon a time, in the tiny village of Totopara near the mountains, there lived a brave boy named Raju.

One day, a big tiger came near the village! Everyone was scared. But Raju remembered what his grandfather taught him — "If you face your fear with a calm heart, even the tiger will respect you."

Raju stood at the edge of the village with a burning torch and beat the dhol drum loudly — BOOM BOOM BOOM!

The tiger stopped, looked at the brave boy, and slowly walked back into the forest. The village was safe!

From that day, the Toto people celebrated Raju's courage every year with a dance festival. And Raju? He became the youngest village guardian!

Moral: Courage and wisdom can overcome any fear.`,
      bn: `অনেকদিন আগে, পাহাড়ের কাছে টোটোপাড়ার ছোট্ট গ্রামে রাজু নামে এক সাহসী ছেলে থাকত।

একদিন, গ্রামের কাছে একটা বড় বাঘ এসে পড়ল! সবাই খুব ভয় পেয়ে গেল। কিন্তু রাজু মনে করল তার দাদু কী শিখিয়েছিলেন — "শান্ত মনে ভয়ের মুখোমুখি হলে, বাঘও তোমাকে সম্মান করবে।"

রাজু গ্রামের কিনারায় জ্বলন্ত মশাল নিয়ে দাঁড়াল আর জোরে জোরে ঢোল বাজাল — ধুম ধুম ধুম!

বাঘ থেমে গেল, সাহসী ছেলেটির দিকে তাকাল, আর আস্তে আস্তে বনে ফিরে গেল। গ্রাম রক্ষা পেল!

সেদিন থেকে, টোটো মানুষ প্রতি বছর রাজুর সাহসিকতা উদযাপন করে নাচের উৎসব দিয়ে। আর রাজু? সে হয়ে গেল সবচেয়ে কম বয়সী গ্রাম রক্ষক!

শিক্ষা: সাহস আর বুদ্ধি দিয়ে যেকোনো ভয় জয় করা যায়।`
    }
  },
  {
    title: { en: 'The River and the Drum', bn: 'নদী আর ঢোল' },
    emoji: '🥁',
    story: {
      en: `Long ago, the Torsha river that flows through Totopara was angry. It rained too much, and the river rose higher and higher!

The village elder, Grandmother Mala, said: "The river is upset because we forgot to thank it. We must sing the old songs."

So all the children gathered bamboo and made drums. They sat by the river and played beautiful music. The children sang:

"Oh Torsha, oh river so wide, we thank you for fish and the green riverside! Please be gentle, please be kind, we'll always keep you in our mind!"

Slowly, the rain stopped. The river became calm and sparkled in the sunlight.

The fish jumped happily, and the children laughed and played by the bank.

Moral: When we respect nature and show gratitude, nature takes care of us too.`,
      bn: `অনেকদিন আগে, টোটোপাড়ার মধ্য দিয়ে বয়ে যাওয়া তোর্ষা নদী খুব রাগ করেছিল। খুব বেশি বৃষ্টি হচ্ছিল, নদী উপচে যাচ্ছিল!

গ্রামের সবচেয়ে বয়স্ক, ঠাকুমা মালা বললেন: "নদী রাগ করেছে কারণ আমরা তাকে ধন্যবাদ দিতে ভুলে গেছি। আমাদের পুরানো গান গাইতে হবে।"

তাই সব ছেলেমেয়ে বাঁশ জড়ো করে ঢোল বানাল। তারা নদীর ধারে বসে সুন্দর সুর বাজাল।

আস্তে আস্তে, বৃষ্টি থামল। নদী শান্ত হয়ে রোদে ঝিকমিক করতে লাগল।

মাছ আনন্দে লাফাল, আর ছেলেমেয়ে হাসতে হাসতে পাড়ে খেলল।

শিক্ষা: যখন আমরা প্রকৃতিকে সম্মান করি আর কৃতজ্ঞতা দেখাই, প্রকৃতিও আমাদের যত্ন নেয়।`
    }
  },
  {
    title: { en: 'The Magic Bamboo Flute', bn: 'জাদু বাঁশের বাঁশি' },
    emoji: '🎋',
    story: {
      en: `In Totopara, bamboo grows everywhere — tall and green!

A little girl named Sunita loved music. One day, her grandfather carved a beautiful flute from a bamboo stick and gave it to her.

"This is a magic flute," he said with a wink. "When you play it with a happy heart, good things happen!"

Sunita played the flute every evening. When she played, the birds would come and sit nearby. The butterflies would dance around her. Even the shy deer from the forest would peek out to listen!

One day, Sunita played her flute for a sick friend, and her friend smiled for the first time in days!

"See?" said grandfather. "The magic is not in the flute — it's in the love you put into your music!"

Moral: When you do things with love, they become magical.`,
      bn: `টোটোপাড়ায় সবখানে বাঁশ জন্মায় — লম্বা আর সবুজ!

সুনীতা নামে একটি ছোট মেয়ে গান খুব ভালবাসত। একদিন, তার দাদু একটি বাঁশের কাঠি থেকে সুন্দর বাঁশি তৈরি করে তাকে দিলেন।

"এটা একটা জাদু বাঁশি," দাদু চোখ টিপে বললেন। "যখন তুমি আনন্দ ভরা মন নিয়ে বাজাবে, ভালো জিনিস ঘটবে!"

সুনীতা প্রতিদিন সন্ধ্যায় বাঁশি বাজাত। পাখিরা এসে কাছে বসত। প্রজাপতি তার চারপাশে নাচত।

একদিন, সুনীতা তার অসুস্থ বন্ধুর জন্য বাঁশি বাজাল, আর তার বন্ধু অনেকদিন পর প্রথমবার হাসল!

"দেখলে?" দাদু বললেন। "জাদু বাঁশিতে নয় — তুমি যে ভালোবাসা দিয়ে বাজাও, সেটাই জাদু!"

শিক্ষা: যখন তুমি ভালোবাসা দিয়ে কিছু করো, তা জাদু হয়ে যায়।`
    }
  },
  {
    title: { en: 'How Toto People Got Their Name', bn: 'টোটো মানুষ তাদের নাম কীভাবে পেল' },
    emoji: '🏔️',
    story: {
      en: `A very long time ago, a group of people lived high up in the mountains near Bhutan.

They were kind, hardworking people who loved their land. They grew rice in tiny fields, caught fish in the streams, and made beautiful baskets from bamboo.

One day, a traveler came to their village and asked: "What do you call yourselves?"

The people looked at each other and smiled. Their elder said: "We call ourselves 'Toto' — it means 'the people of this land.' This is our home, and we are one with it."

The traveler was amazed at how happy they were. They had no big cities, no fancy things — but they had their language, their songs, their dances, and each other.

Today, the Toto people still live in Totopara, keeping their beautiful language alive. And YOU are helping too, by learning Toto words!

Moral: Our identity and language are our greatest treasures.`,
      bn: `অনেক অনেকদিন আগে, ভুটানের কাছে পাহাড়ের উঁচুতে একদল মানুষ বাস করত।

তারা ছিল দয়ালু, কর্মঠ মানুষ যারা তাদের দেশকে ভালোবাসত। ছোট ছোট ক্ষেতে ধান ফলাত, ঝর্ণা থেকে মাছ ধরত, আর বাঁশ দিয়ে সুন্দর ঝুড়ি বানাত।

একদিন, একজন পর্যটক তাদের গ্রামে এসে জিজ্ঞেস করলেন: "তোমরা নিজেদের কী বলো?"

মানুষজন পরস্পরের দিকে তাকিয়ে হাসল। তাদের বড়ো বললেন: "আমরা নিজেদের 'টোটো' বলি — এর মানে 'এই ভূমির মানুষ।' এটা আমাদের ঘর, আমরা এর সাথে একাত্ম।"

আজও, টোটো মানুষ টোটোপাড়ায় বাস করে, তাদের সুন্দর ভাষা বাঁচিয়ে রেখে। আর তুমিও সাহায্য করছো, টোটো শব্দ শিখে!

শিক্ষা: আমাদের পরিচয় আর ভাষাই আমাদের সবচেয়ে বড় সম্পদ।`
    }
  },
  {
    title: { en: 'The Festival of Lights', bn: 'আলোর উৎসব' },
    emoji: '🪔',
    story: {
      en: `Every year, the Toto people have a special festival where they light hundreds of small lamps made from clay and oil!

Little Mohan was excited — this was his first time helping with the festival!

His mother gave him a small lamp and said: "Mohan, carry this carefully to the big tree in the center of the village."

Mohan walked very slowly, protecting the tiny flame from the wind. Oh no! The wind blew harder! Mohan cupped his hands around the lamp and kept walking.

When he finally reached the big tree, he placed his lamp next to hundreds of others. Together, all the small lamps created a beautiful sea of light!

"See, Mohan?" said his mother. "One small lamp doesn't seem like much. But together, all our lights can brighten the whole village!"

Moral: Even small efforts, when combined together, can create something beautiful.`,
      bn: `প্রতি বছর, টোটো মানুষ একটি বিশেষ উৎসব করে যেখানে শত শত মাটি আর তেলের ছোট ছোট প্রদীপ জ্বালানো হয়!

ছোট্ট মোহন খুব উত্তেজিত ছিল — এই প্রথমবার সে উৎসবে সাহায্য করবে!

মা তাকে একটি ছোট প্রদীপ দিয়ে বললেন: "মোহন, এটা যত্ন করে গ্রামের মাঝখানে বড় গাছটার কাছে নিয়ে যা।"

মোহন খুব আস্তে আস্তে হাঁটল, হাত দিয়ে ছোট্ট আগুনটাকে বাতাস থেকে আড়াল করল।

যখন সে বড় গাছটার কাছে পৌঁছাল, শত শত প্রদীপের পাশে তার প্রদীপটাও রাখল। একসাথে সব ছোট প্রদীপ মিলে তৈরি হলো আলোর সমুদ্র!

"দেখলে, মোহন?" মা বললেন। "একটা ছোট প্রদীপ বেশি কিছু মনে হয় না। কিন্তু একসাথে সবার আলো মিলে পুরো গ্রাম আলো করে দেয়!"

শিক্ষা: ছোট ছোট চেষ্টা একসাথে মিলে সুন্দর কিছু তৈরি করতে পারে।`
    }
  },
];

type Lang = 'en' | 'bn';

// ==========================================
// Q&A — Bilingual
// ==========================================
interface QAPair { keywords: string[]; response: { en: string; bn: string }; }
const QA_PAIRS: QAPair[] = [
  {
    keywords: ['hello', 'hi', 'hey', 'namaste', 'হ্যালো', 'নমস্কার'],
    response: { en: "Hello friend! 👋🦉 I'm Toto Buddy, your learning helper! What would you like to know?", bn: "হ্যালো বন্ধু! 👋🦉 আমি টোটো বাডি, তোমার শেখার সাথী! কী জানতে চাও?" }
  },
  {
    keywords: ['how', 'play', 'start', 'begin', 'use', 'কীভাবে', 'খেলি', 'শুরু'],
    response: { en: "It's easy! 🎮\n\n1️⃣ Go to **Learn** tab to discover new words\n2️⃣ Swipe right to learn a word\n3️⃣ Go to **Play** tab for fun games!\n4️⃣ Check the **Map** to see your journey!", bn: "এটা সহজ! 🎮\n\n1️⃣ **শেখা** ট্যাবে যাও নতুন শব্দ জানতে\n2️⃣ ডানে সোয়াইপ করো শব্দ শিখতে\n3️⃣ **খেলা** ট্যাবে যাও মজার গেমের জন্য!\n4️⃣ **ম্যাপ** দেখো তোমার যাত্রা দেখতে!" }
  },
  {
    keywords: ['totopara', 'toto', 'village', 'where', 'live', 'টোটোপাড়া', 'গ্রাম'],
    response: { en: "Totopara is a beautiful tiny village near the mountains! 🏔️ It's in West Bengal, India, very close to Bhutan. The Toto people live there — only about 1,600 people speak Toto!", bn: "টোটোপাড়া পাহাড়ের কাছে একটি সুন্দর ছোট গ্রাম! 🏔️ এটি পশ্চিমবঙ্গে, ভুটানের কাছে। মাত্র ১,৬০০ জন মানুষ টোটো ভাষায় কথা বলে!" }
  },
  {
    keywords: ['star', 'stars', 'earn', 'তারা', 'পাই'],
    response: { en: "You earn stars by doing great in games! ⭐\n\n⭐ 1 star = Good try!\n⭐⭐ 2 stars = Great job!\n⭐⭐⭐ 3 stars = Perfect!", bn: "গেমে ভালো করলে তারা পাবে! ⭐\n\n⭐ ১ তারা = ভালো চেষ্টা!\n⭐⭐ ২ তারা = দারুণ!\n⭐⭐⭐ ৩ তারা = পারফেক্ট!" }
  },
  {
    keywords: ['coin', 'coins', 'xp', 'কয়েন'],
    response: { en: "You earn coins by learning! 🪙\n\n📖 Learn a new word = 5 coins\n🎮 Win a game = 50+ coins\n⭐ Perfect score = bonus coins!", bn: "শিখলে কয়েন পাবে! 🪙\n\n📖 নতুন শব্দ = ৫ কয়েন\n🎮 গেম জিতলে = ৫০+ কয়েন\n⭐ পারফেক্ট = বোনাস কয়েন!" }
  },
  {
    keywords: ['story', 'stories', 'tell', 'once upon', 'গল্প', 'বলো'],
    response: { en: "I love telling stories! 📖✨ I know 5 wonderful Toto stories:\n\n🐯 The Brave Toto Boy\n🥁 The River and the Drum\n🎋 The Magic Bamboo Flute\n🏔️ How Toto People Got Their Name\n🪔 The Festival of Lights\n\nTap any story below! 😊", bn: "আমি গল্প বলতে ভালোবাসি! 📖✨ আমি ৫টি টোটো গল্প জানি:\n\n🐯 সাহসী টোটো ছেলে\n🥁 নদী আর ঢোল\n🎋 জাদু বাঁশের বাঁশি\n🏔️ টোটো মানুষের নাম\n🪔 আলোর উৎসব\n\nযেকোনো গল্পে ট্যাপ করো! 😊" }
  },
  {
    keywords: ['brave', 'boy', 'tiger', 'raju', 'সাহসী', 'বাঘ', 'রাজু'],
    response: { en: TOTO_STORIES[0].story.en, bn: TOTO_STORIES[0].story.bn }
  },
  {
    keywords: ['river', 'drum', 'torsha', 'নদী', 'ঢোল'],
    response: { en: TOTO_STORIES[1].story.en, bn: TOTO_STORIES[1].story.bn }
  },
  {
    keywords: ['bamboo', 'flute', 'sunita', 'magic flute', 'বাঁশি', 'সুনীতা'],
    response: { en: TOTO_STORIES[2].story.en, bn: TOTO_STORIES[2].story.bn }
  },
  {
    keywords: ['name', 'got their name', 'origin', 'নাম', 'কীভাবে পেল'],
    response: { en: TOTO_STORIES[3].story.en, bn: TOTO_STORIES[3].story.bn }
  },
  {
    keywords: ['festival', 'lights', 'lamp', 'mohan', 'উৎসব', 'আলো', 'মোহন'],
    response: { en: TOTO_STORIES[4].story.en, bn: TOTO_STORIES[4].story.bn }
  },
  {
    keywords: ['game', 'games', 'which', 'গেম', 'খেলা'],
    response: { en: "We have lots of fun games! 🎮\n\n🧩 Puzzle Builder\n🏃 Toto Runner\n🗺️ Treasure Hunt\n🏗️ Block Builder\n🔍 Word Finder\n⚡ Quick Challenge\n🐒 Monkey Arrow\n📝 Spelling Learner\n\nGo to the **Play** tab to try them!", bn: "আমাদের অনেক মজার গেম আছে! 🎮\n\n🧩 পাজল বিল্ডার\n🏃 টোটো রানার\n🗺️ ট্রেজার হান্ট\n🏗️ ব্লক বিল্ডার\n🔍 শব্দ খোঁজা\n⚡ দ্রুত চ্যালেঞ্জ\n🐒 বানর তীর\n📝 বানান শেখা\n\n**খেলা** ট্যাবে যাও!" }
  },
  {
    keywords: ['help', 'what can', 'সাহায্য', 'কী পারো'],
    response: { en: "I can help with lots of things! 😊\n\n📖 Tell you fun **Toto stories**\n🗺️ Explain how the **app works**\n🎮 Help you find **games**\n🏔️ Tell you about **Totopara**\n🌱 Explain why Toto language is **important**\n\nJust ask! 👇", bn: "আমি অনেক কিছুতে সাহায্য করতে পারি! 😊\n\n📖 মজার **টোটো গল্প** বলতে পারি\n🗺️ **অ্যাপ কীভাবে কাজ করে** বুঝাতে পারি\n🎮 **গেম** খুঁজে দিতে পারি\n🏔️ **টোটোপাড়া** সম্পর্কে বলতে পারি\n\nশুধু জিজ্ঞেস করো! 👇" }
  },
  {
    keywords: ['language', 'endangered', 'why', 'save', 'ভাষা', 'কেন', 'বিপন্ন'],
    response: { en: "Great question! 🌱 The Toto language is very special — only about **1,600 people** in the whole world speak it! That's less than kids in one school!\n\nIf we don't learn it, it might disappear forever. But YOU are helping save it by learning Toto words! 💪🌟", bn: "দারুণ প্রশ্ন! 🌱 টোটো ভাষা খুবই বিশেষ — পুরো পৃথিবীতে মাত্র **১,৬০০ জন** এটা বলে! এটা একটা স্কুলের বাচ্চাদের চেয়েও কম!\n\nআমরা যদি না শিখি, এটা হারিয়ে যেতে পারে। কিন্তু তুমি টোটো শব্দ শিখে এটা বাঁচাচ্ছো! 💪🌟" }
  },
  {
    keywords: ['people', 'tribe', 'community', 'জনগোষ্ঠী', 'মানুষ'],
    response: { en: "The Toto people are amazing! 👥 They live in Totopara village near the mountains. They make beautiful bamboo crafts, dance during festivals, and have their own special language!", bn: "টোটো মানুষ অসাধারণ! 👥 তারা পাহাড়ের কাছে টোটোপাড়ায় থাকে। তারা সুন্দর বাঁশের জিনিস বানায়, উৎসবে নাচে, আর তাদের নিজস্ব ভাষা আছে!" }
  },
  {
    keywords: ['food', 'eat', 'rice', 'খাবার', 'ভাত'],
    response: { en: "Toto food is yummy! 🍚 They eat rice, fresh vegetables, fish from the rivers, and a special drink called \"Eu\" made from millet!", bn: "টোটো খাবার দারুণ! 🍚 তারা ভাত, তাজা সবজি, নদীর মাছ, আর মিলেট থেকে তৈরি \"ইউ\" নামের বিশেষ পানীয় খায়!" }
  },
  {
    keywords: ['animal', 'animals', 'dog', 'cat', 'প্রাণী', 'জানোয়ার'],
    response: { en: "The Toto people live near a big forest! 🌲 Tigers, elephants, deer, colorful birds, and fish live nearby!", bn: "টোটো মানুষ বড় বনের কাছে থাকে! 🌲 বাঘ, হাতি, হরিণ, রঙিন পাখি, আর মাছ আশেপাশে থাকে!" }
  },
  {
    keywords: ['thank', 'thanks', 'awesome', 'cool', 'ধন্যবাদ', 'দারুণ'],
    response: { en: "You're welcome, friend! 🤗 Keep learning and having fun! 🦉💛", bn: "স্বাগতম, বন্ধু! 🤗 শিখতে থাকো আর মজা করো! 🦉💛" }
  },
  {
    keywords: ['bye', 'goodbye', 'বিদায়', 'আবার দেখা'],
    response: { en: "Bye bye! 👋🦉 Come back soon! You're doing amazing! 🌟", bn: "বাই বাই! 👋🦉 তাড়াতাড়ি আবার এসো! তুমি দারুণ করছো! 🌟" }
  },
  {
    keywords: ['who are you', 'your name', 'তুমি কে', 'তোমার নাম'],
    response: { en: "I'm **Toto Buddy**! 🦉 A friendly owl from Totopara village. I love teaching kids about Toto language and culture!", bn: "আমি **টোটো বাডি**! 🦉 টোটোপাড়ার একটা বন্ধু পেঁচা। আমি ছেলেমেয়েদের টোটো ভাষা আর সংস্কৃতি শেখাতে ভালোবাসি!" }
  },
  {
    keywords: ['joke', 'funny', 'হাসি', 'মজার'],
    response: { en: "Why did the Toto owl go to school? Because he wanted to be a WISE owl! 🦉📚 Ha ha! 😆", bn: "টোটো পেঁচা স্কুলে কেন গেল? কারণ সে বুদ্ধিমান পেঁচা হতে চেয়েছিল! 🦉📚 হা হা! 😆" }
  },
  {
    keywords: ['spell', 'spelling', 'letters', 'বানান', 'অক্ষর'],
    response: { en: "Try our **Spelling Learner** game! 📝 See a picture, tap letters to spell the word. Wrong letters flash red, right ones stay blue! Go to **Play** tab!", bn: "**বানান শেখা** গেমটা খেলো! 📝 ছবি দেখো, অক্ষরে ট্যাপ করে শব্দ বানাও। ভুল অক্ষর লাল হয়, ঠিক অক্ষর নীল থাকে! **খেলা** ট্যাবে যাও!" }
  },
];

const FALLBACK = {
  en: "Hmm, I'm not sure about that! 🤔 Try asking about stories, games, or Totopara! 👇",
  bn: "হুম, এটা আমি ঠিক জানি না! 🤔 গল্প, গেম, বা টোটোপাড়া সম্পর্কে জিজ্ঞেস করো! 👇"
};

function findResponse(input: string, lang: Lang): string {
  const lower = input.toLowerCase().trim();
  if (!lower) return FALLBACK[lang];

  let bestMatch = { score: 0, response: FALLBACK[lang] };
  for (const qa of QA_PAIRS) {
    let score = 0;
    for (const keyword of qa.keywords) {
      if (lower.includes(keyword)) score += keyword.length;
    }
    if (score > bestMatch.score) {
      bestMatch = { score, response: qa.response[lang] };
    }
  }
  return bestMatch.response;
}

// ==========================================
// TTS — Chunked for long stories
// ==========================================
let ttsQueue: SpeechSynthesisUtterance[] = [];

function speakText(text: string, lang: Lang) {
  try {
    stopSpeaking();
    // Clean text: strip markdown, emojis, extra whitespace
    const clean = text
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/[^\p{L}\p{N}\p{P}\p{Z}\n]/gu, ' ')
      .replace(/\n+/g, '. ')
      .replace(/\s+/g, ' ')
      .trim();
    if (!clean) return;

    // Split into chunks at sentence boundaries (max ~150 chars each)
    const sentences = clean.split(/(?<=[.!?।])\s+/);
    const chunks: string[] = [];
    let current = '';
    for (const s of sentences) {
      if ((current + ' ' + s).length > 150 && current) {
        chunks.push(current.trim());
        current = s;
      } else {
        current += (current ? ' ' : '') + s;
      }
    }
    if (current.trim()) chunks.push(current.trim());

    // Queue each chunk
    ttsQueue = chunks.map(chunk => {
      const u = new SpeechSynthesisUtterance(chunk);
      u.lang = lang === 'bn' ? 'bn-IN' : 'en-US';
      u.rate = 0.9;
      u.pitch = 1.05;
      return u;
    });

    // Play sequentially
    function playNext() {
      if (ttsQueue.length === 0) return;
      const next = ttsQueue.shift()!;
      next.onend = playNext;
      next.onerror = playNext;
      speechSynthesis.speak(next);
    }
    playNext();
  } catch { /* ignore */ }
}

function stopSpeaking() {
  try { speechSynthesis.cancel(); ttsQueue = []; } catch { }
}

// ==========================================
// QUICK PROMPTS
// ==========================================
const QUICK_PROMPTS = {
  en: [
    { emoji: '📖', label: 'Tell a Story', text: 'Tell me a Toto story!' },
    { emoji: '🎮', label: 'Play Games', text: 'What games can I play?' },
    { emoji: '🏔️', label: 'Totopara', text: 'Tell me about Totopara' },
    { emoji: '❓', label: 'How to Play', text: 'How do I play?' },
    { emoji: '🌱', label: 'Why Toto?', text: 'Why should I learn Toto?' },
    { emoji: '😊', label: 'Who Are You?', text: 'Who are you?' },
  ],
  bn: [
    { emoji: '📖', label: 'গল্প বলো', text: 'আমাকে একটা টোটো গল্প বলো!' },
    { emoji: '🎮', label: 'গেম', text: 'কী কী গেম আছে?' },
    { emoji: '🏔️', label: 'টোটোপাড়া', text: 'টোটোপাড়া সম্পর্কে বলো' },
    { emoji: '❓', label: 'কীভাবে খেলি', text: 'কীভাবে খেলতে হয়?' },
    { emoji: '🌱', label: 'কেন শিখব?', text: 'টোটো কেন শিখব?' },
    { emoji: '😊', label: 'তুমি কে?', text: 'তুমি কে?' },
  ],
};

const WELCOME = {
  en: "Hi there! 👋 I'm **Toto Buddy**, your friendly owl! 🦉\n\nI can tell you stories 📖, help with games 🎮, and teach you about Totopara 🏔️!\n\nTap a button below or just type! 😊",
  bn: "হ্যালো! 👋 আমি **টোটো বাডি**, তোমার বন্ধু পেঁচা! 🦉\n\nআমি গল্প বলতে পারি 📖, গেমে সাহায্য করতে পারি 🎮, আর টোটোপাড়া সম্পর্কে শেখাতে পারি 🏔️!\n\nনিচের বোতামে ট্যাপ করো বা লেখো! 😊",
};

// ==========================================
// COMPONENT
// ==========================================
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

export default function ChatbotTab() {
  const { language: appLang } = useLanguage();
  const lang: Lang = appLang === 'bn' ? 'bn' : 'en';

  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', text: WELCOME[lang], sender: 'bot' },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [showStories, setShowStories] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  useEffect(() => {
    const check = setInterval(() => setIsSpeaking(speechSynthesis.speaking), 200);
    return () => { clearInterval(check); stopSpeaking(); };
  }, []);

  // Update welcome when language changes
  useEffect(() => {
    setMessages([{ id: 'welcome', text: WELCOME[lang], sender: 'bot' }]);
  }, [lang]);

  const handleSend = useCallback((text?: string) => {
    const msg = (text || input).trim();
    if (!msg || isTyping) return;
    setMessages(prev => [...prev, { id: `u-${Date.now()}`, text: msg, sender: 'user' }]);
    setInput('');
    setIsTyping(true);
    setShowStories(false);

    setTimeout(() => {
      setIsTyping(false);
      const response = findResponse(msg, lang);
      setMessages(prev => [...prev, { id: `b-${Date.now()}`, text: response, sender: 'bot' }]);
      if (ttsEnabled) speakText(response, lang);
      if (response.includes('story') || response.includes('গল্প')) setShowStories(true);
    }, 600 + Math.random() * 400);
  }, [input, isTyping, ttsEnabled, lang]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const formatText = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) =>
      part.startsWith('**') && part.endsWith('**')
        ? <strong key={i} className="font-extrabold">{part.slice(2, -2)}</strong>
        : <span key={i}>{part}</span>
    );
  };

  const showQuickPrompts = messages.length <= 2 && !isTyping;
  const storyChips = TOTO_STORIES.map(s => ({
    emoji: s.emoji,
    label: s.title[lang],
    text: lang === 'bn' ? `${s.title.bn} গল্পটা বলো` : `Tell me the story of ${s.title.en}`,
  }));
  const headerTitle = lang === 'bn' ? 'টোটো বাডি' : 'Toto Buddy';
  const headerStatus = lang === 'bn' ? 'চ্যাটের জন্য প্রস্তুত!' : 'Ready to chat!';
  const placeholder = lang === 'bn' ? 'যেকোনো কিছু জিজ্ঞেস করো... 😊' : 'Ask me anything... 😊';

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 0px)', background: 'linear-gradient(180deg, #EDE9FE 0%, #FFF7ED 50%, #F0FDF4 100%)' }}>
      {/* Header */}
      <div className="px-4 py-3 flex-shrink-0 z-10" style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)' }}>
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center text-2xl shadow-lg">🦉</div>
            <div>
              <h1 className="text-[16px] font-extrabold text-white leading-tight">{headerTitle}</h1>
              <p className="text-[11px] text-violet-200 font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-400 inline-block" /> {headerStatus}
              </p>
            </div>
          </div>
          <button
            onClick={() => { setTtsEnabled(e => !e); stopSpeaking(); }}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90 ${ttsEnabled ? 'bg-white/20 text-white' : 'bg-white/10 text-white/50'}`}
          >
            {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 no-scrollbar">
        <div className="max-w-lg mx-auto space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              {msg.sender === 'bot' && (
                <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-lg mr-2 mt-1 flex-shrink-0 shadow-sm">🦉</div>
              )}
              <div className="flex flex-col max-w-[82%]">
                <div className={`px-4 py-3 rounded-2xl text-[13.5px] leading-relaxed whitespace-pre-line ${msg.sender === 'user'
                    ? 'bg-violet-600 text-white rounded-br-md shadow-md'
                    : 'bg-white text-gray-800 rounded-bl-md shadow-sm border border-gray-100'
                  }`}>
                  {msg.sender === 'bot' ? formatText(msg.text) : msg.text}
                </div>
                {msg.sender === 'bot' && (
                  <button
                    onClick={() => isSpeaking ? stopSpeaking() : speakText(msg.text, lang)}
                    className="mt-1 self-start flex items-center gap-1 text-[10px] text-violet-500 hover:text-violet-700 active:scale-95 transition-all px-1"
                  >
                    <Volume2 className="w-3 h-3" />
                    {isSpeaking ? (lang === 'bn' ? 'থামাও' : 'Stop') : (lang === 'bn' ? 'পড়ে শোনাও' : 'Read aloud')}
                  </button>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start animate-fade-in">
              <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-lg mr-2 mt-1 flex-shrink-0">🦉</div>
              <div className="bg-white shadow-sm rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5 border border-gray-100">
                <span className="w-2.5 h-2.5 rounded-full bg-violet-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2.5 h-2.5 rounded-full bg-violet-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2.5 h-2.5 rounded-full bg-violet-300 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Prompts */}
      {showQuickPrompts && (
        <div className="px-4 pb-2 flex-shrink-0">
          <div className="max-w-lg mx-auto">
            <p className="text-xs text-violet-600 font-semibold mb-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> {lang === 'bn' ? 'ট্যাপ করে জিজ্ঞেস করো!' : 'Tap to ask me!'}
            </p>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {QUICK_PROMPTS[lang].map(p => (
                <button key={p.label} onClick={() => handleSend(p.text)}
                  className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white shadow-sm border border-gray-100 active:scale-95 hover:shadow-md transition-all whitespace-nowrap">
                  <span className="text-lg">{p.emoji}</span>
                  <span className="text-[11px] font-semibold text-gray-700">{p.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Story chips */}
      {showStories && !isTyping && (
        <div className="px-4 pb-2 flex-shrink-0">
          <div className="max-w-lg mx-auto">
            <p className="text-xs text-amber-600 font-semibold mb-2 flex items-center gap-1">
              <BookOpen className="w-3 h-3" /> {lang === 'bn' ? 'একটা গল্প বেছে নাও!' : 'Pick a story!'}
            </p>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {storyChips.map(s => (
                <button key={s.label} onClick={() => { handleSend(s.text); setShowStories(false); }}
                  className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold whitespace-nowrap active:scale-95 hover:bg-amber-100 transition-all shadow-sm">
                  <span className="text-lg">{s.emoji}</span> {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mini suggestions */}
      {!showQuickPrompts && !showStories && !isTyping && (
        <div className="px-4 pb-1 flex-shrink-0">
          <div className="max-w-lg mx-auto flex gap-2 overflow-x-auto no-scrollbar">
            {(lang === 'bn'
              ? [{ e: '📖', t: 'গল্প বলো' }, { e: '🎮', t: 'গেম' }, { e: '🏔️', t: 'টোটোপাড়া' }, { e: '❓', t: 'সাহায্য' }]
              : [{ e: '📖', t: 'Tell a story' }, { e: '🎮', t: 'Games' }, { e: '🏔️', t: 'Totopara' }, { e: '❓', t: 'Help' }]
            ).map(s => (
              <button key={s.t} onClick={() => handleSend(s.t)}
                className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full bg-violet-50 border border-violet-200 text-violet-700 text-[11px] font-semibold whitespace-nowrap active:scale-95 hover:bg-violet-100 transition-all">
                {s.e} {s.t}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input bar */}
      <div className="bg-white/95 backdrop-blur-sm px-4 py-3 pb-[88px] flex-shrink-0 border-t border-gray-200">
        <div className="max-w-lg mx-auto flex items-center gap-2">
          <input
            type="text" value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="flex-1 px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all placeholder:text-gray-400"
          />
          <button onClick={() => handleSend()} disabled={!input.trim() || isTyping}
            className="w-11 h-11 rounded-full bg-violet-600 flex items-center justify-center flex-shrink-0 disabled:opacity-30 active:scale-90 hover:bg-violet-700 transition-all duration-150 shadow-md">
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
