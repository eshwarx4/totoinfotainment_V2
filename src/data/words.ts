import { WordItem } from "@/types/content";
import { getEmojiImageUrl } from "@/lib/emojiImages";

function img(english: string, category: string, existing?: string): string {
  // Use existing image if it's a real file path, otherwise emoji fallback
  if (existing && !existing.includes('placeholder')) return existing;
  return getEmojiImageUrl(english, category);
}

export const words: WordItem[] = [
  {
    id: "word_001",
    english: "apple",
    toto: "সেব",
    transliteration: "seb",
    imageUrl: "/images/words/apple.png",
    audioToto: "/content/audio/words/word_001_toto.mp3",
    audioEnglish: "/content/audio/words/word_001_eng.mp3",
    category: "Food",
    usageSentenceToto: "আমি একটা সেব খাই",
    usageSentenceEnglish: "I eat an apple"
  },
  {
    id: "word_002",
    english: "water",
    toto: "পানি",
    transliteration: "pani",
    imageUrl: "/images/words/water.png",
    audioToto: "/content/audio/words/word_002_toto.mp3",
    audioEnglish: "/content/audio/words/word_002_eng.mp3",
    category: "Nature",
    usageSentenceToto: "পানি পিন্তু",
    usageSentenceEnglish: "Drink water"
  },
  {
    id: "word_003",
    english: "sun",
    toto: "নাম",
    transliteration: "naam",
    imageUrl: "/images/words/sun.png",
    audioToto: "/content/audio/words/word_003_toto.mp3",
    audioEnglish: "/content/audio/words/word_003_eng.mp3",
    category: "Nature",
    usageSentenceToto: "নাম উঠলো",
    usageSentenceEnglish: "The sun rises"
  },
  {
    id: "word_004",
    english: "tree",
    toto: "দাং",
    transliteration: "dang",
    imageUrl: img("tree", "Plants"),
    audioToto: "/content/audio/words/word_004_toto.mp3",
    audioEnglish: "/content/audio/words/word_004_eng.mp3",
    category: "Plants",
    usageSentenceToto: "বড় দাং",
    usageSentenceEnglish: "Big tree"
  },
  {
    id: "word_005",
    english: "dog",
    toto: "কুতা",
    transliteration: "kuta",
    imageUrl: img("dog", "Animals"),
    audioToto: "/content/audio/words/word_005_toto.mp3",
    audioEnglish: "/content/audio/words/word_005_eng.mp3",
    category: "Animals",
    usageSentenceToto: "কুতা ঘেউ ঘেউ করে",
    usageSentenceEnglish: "The dog barks"
  },
  {
    id: "word_006",
    english: "hand",
    toto: "হাত",
    transliteration: "hath",
    imageUrl: img("hand", "Body"),
    audioToto: "/content/audio/words/word_006_toto.mp3",
    audioEnglish: "/content/audio/words/word_006_eng.mp3",
    category: "Body",
    usageSentenceToto: "হাত ধোও",
    usageSentenceEnglish: "Wash your hands"
  },
  {
    id: "word_007",
    english: "book",
    toto: "বই",
    transliteration: "boi",
    imageUrl: img("book", "Objects"),
    audioToto: "/content/audio/words/word_007_toto.mp3",
    audioEnglish: "/content/audio/words/word_007_eng.mp3",
    category: "Objects",
    usageSentenceToto: "বই পড়",
    usageSentenceEnglish: "Read the book"
  },
  {
    id: "word_008",
    english: "rice",
    toto: "ভাত",
    transliteration: "bhaat",
    imageUrl: img("rice", "Food"),
    audioToto: "/content/audio/words/word_008_toto.mp3",
    audioEnglish: "/content/audio/words/word_008_eng.mp3",
    category: "Food",
    usageSentenceToto: "ভাত খাই",
    usageSentenceEnglish: "Eat rice"
  },
  {
    id: "word_009",
    english: "cat",
    toto: "বিড়াল",
    transliteration: "biral",
    imageUrl: img("cat", "Animals"),
    audioToto: "/content/audio/words/word_009_toto.mp3",
    audioEnglish: "/content/audio/words/word_009_eng.mp3",
    category: "Animals",
    usageSentenceToto: "বিড়াল মিয়াও মিয়াও করে",
    usageSentenceEnglish: "The cat meows"
  },
  {
    id: "word_010",
    english: "flower",
    toto: "ফুল",
    transliteration: "phool",
    imageUrl: img("flower", "Plants"),
    audioToto: "/content/audio/words/word_010_toto.mp3",
    audioEnglish: "/content/audio/words/word_010_eng.mp3",
    category: "Plants",
    usageSentenceToto: "সুন্দর ফুল",
    usageSentenceEnglish: "Beautiful flower"
  }
];
