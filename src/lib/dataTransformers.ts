import { WordRow, ConceptRow, ConceptSlideRow, StoryRow } from './supabaseQueries';
import { WordItem, Story, StorySlide } from '@/types/content';
import { getEmojiImageUrl } from './emojiImages';

/**
 * Transform WordRow from database to WordItem for components
 */
export function transformWordRowToWordItem(row: WordRow): WordItem {
  const category = row.category || 'Nature';

  return {
    id: row.id,
    english: row.english_word,
    toto: row.toto_narration || row.english_word,
    transliteration: '',
    imageUrl: row.image_url || getEmojiImageUrl(row.english_word, category),
    audioToto: row.audio_toto_url || '',
    audioEnglish: row.audio_english_url || '',
    category,
    usageSentenceToto: row.toto_narration || undefined,
    usageSentenceEnglish: row.use_case_sentence || undefined,
  };
}

/**
 * Transform ConceptRow and ConceptSlideRow to Story format for components
 */
export function transformConceptToStory(concept: ConceptRow, slides: ConceptSlideRow[]): Story {
  return {
    id: concept.id,
    title: concept.title,
    description: `Learn about ${concept.title.toLowerCase()}`,
    thumbnail: slides[0]?.image_url || '/images/stories/evaporation.png',
    category: 'science',
    slides: slides.map((slide) => ({
      slideNumber: slide.slide_number,
      toto: slide.toto_narration || slide.english_narration,
      english: slide.english_narration,
      imageUrl: slide.image_url || '/images/stories/evaporation.png',
      audioToto: slide.audio_toto_url || '',
      audioEnglish: slide.audio_english_url || '',
    })),
  };
}

/**
 * Transform StoryRow to Story format for components
 */
export function transformStoryRowToStory(row: StoryRow): Story {
  // For folk stories, we'll create a single slide story
  return {
    id: row.id,
    title: row.title,
    description: row.cultural_meaning || row.english_narration.substring(0, 100) + '...',
    thumbnail: row.image_url || '/images/stories/evaporation.png',
    category: row.type.toLowerCase().includes('folk') ? 'cultural' : 'general',
    slides: [
      {
        slideNumber: 1,
        toto: row.toto_narration || row.english_narration,
        english: row.english_narration,
        imageUrl: row.image_url || '/images/stories/evaporation.png',
        audioToto: row.audio_toto_url || '',
        audioEnglish: row.audio_english_url || '',
      },
    ],
  };
}

