export interface WordItem {
  id: string;
  english: string;
  toto: string;
  transliteration: string;
  imageUrl: string;
  audioToto: string;
  audioEnglish: string;
  category: string; // any category from word data
  usageSentenceToto?: string;
  usageSentenceEnglish?: string;
}

export interface StorySlide {
  slideNumber: number;
  toto: string;
  english: string;
  imageUrl: string;
  audioToto: string;
  audioEnglish: string;
}

export interface Story {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  slides: StorySlide[];
  category: 'science' | 'cultural' | 'general';
}

export interface QuizQuestion {
  id: string;
  type: 'image-mcq' | 'text-mcq';
  questionAudio?: string;
  questionText?: string;
  options: Array<{
    id: string;
    text?: string;
    imageUrl?: string;
  }>;
  correctAnswer: string;
  ageGroup: '6-9' | '10-14';
}

export interface CulturalItem {
  id: string;
  type: 'folk-story' | 'song';
  title: string;
  description: string;
  imageUrl: string;
  audioToto: string;
  audioEnglish: string;
  duration: number;
}

export interface UserProgress {
  learnedWords: string[];
  completedStories: string[];
  totalStars: number;
  streak: number;
  lastActive: string;
  badges: string[];
}

export interface RecordingItem {
  file_name: string;
  content_id: string;
  human_label: string;
  language: 'toto' | 'english';
  recommended_length_seconds: string;
  recommended_tone: string;
  notes: string;
}
