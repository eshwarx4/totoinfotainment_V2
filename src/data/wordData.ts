// ==========================================
// WORD DATA - sourced from word.csv
// 63 words with Supabase image + audio URLs
// ==========================================

export interface WordItem {
    id: string;
    english: string;
    category: string;
    imageUrl: string;
    audioEnglishUrl: string;
    audioTotoUrl: string;
}

const SUPABASE_BASE = 'https://ryxeculvhjqugxaqscui.supabase.co/storage/v1/object/public';

export const WORD_CATEGORIES = [
    { id: 'Animals', label: 'Animals', emoji: '🐾', color: 'from-emerald-400 to-green-500' },
    { id: 'Food', label: 'Food', emoji: '🍎', color: 'from-orange-400 to-red-500' },
    { id: 'Nature', label: 'Nature', emoji: '🌿', color: 'from-green-400 to-teal-500' },
    { id: 'Body Parts', label: 'Body Parts', emoji: '🫁', color: 'from-pink-400 to-rose-500' },
    { id: 'Actions', label: 'Actions', emoji: '🏃', color: 'from-blue-400 to-indigo-500' },
    { id: 'Emotions', label: 'Emotions', emoji: '😊', color: 'from-yellow-400 to-amber-500' },
    { id: 'Family', label: 'Family', emoji: '👨‍👩‍👧', color: 'from-purple-400 to-violet-500' },
    { id: 'Places', label: 'Places', emoji: '🏘️', color: 'from-cyan-400 to-blue-500' },
    { id: 'Community', label: 'Community', emoji: '🤝', color: 'from-amber-400 to-orange-500' },
];

export const ALL_WORDS: WordItem[] = [
    { id: 'w-angry', english: 'Angry', category: 'Emotions', imageUrl: `${SUPABASE_BASE}/images/Words/angry.png`, audioEnglishUrl: `${SUPABASE_BASE}/audio/words/Angry_eng.mp3`, audioTotoUrl: `${SUPABASE_BASE}/audio/words/Angry_toto.mp3` },
    { id: 'w-apple', english: 'Apple', category: 'Food', imageUrl: `${SUPABASE_BASE}/images/Words/Apple.png`, audioEnglishUrl: `${SUPABASE_BASE}/audio/words/Apple_eng.mp3`, audioTotoUrl: `${SUPABASE_BASE}/audio/words/Apple_toto.mp3` },
    { id: 'w-banana', english: 'Banana', category: 'Food', imageUrl: `${SUPABASE_BASE}/images/Words/Banana.png`, audioEnglishUrl: `${SUPABASE_BASE}/audio/words/Banana_eng.mp3`, audioTotoUrl: `${SUPABASE_BASE}/audio/words/Banana_toto.mp3` },
    { id: 'w-bird', english: 'Bird', category: 'Animals', imageUrl: `${SUPABASE_BASE}/images/Words/bird.png`, audioEnglishUrl: `${SUPABASE_BASE}/audio/words/Bird_eng.mp3`, audioTotoUrl: `${SUPABASE_BASE}/audio/words/Bird_toto.mp3` },
    { id: 'w-bread', english: 'Bread', category: 'Food', imageUrl: `${SUPABASE_BASE}/images/Words/bread.png`, audioEnglishUrl: `${SUPABASE_BASE}/audio/words/Bread_eng.mp3`, audioTotoUrl: `${SUPABASE_BASE}/audio/words/Bread_Toto.mp3` },
    { id: 'w-brother', english: 'Brother', category: 'Family', imageUrl: `${SUPABASE_BASE}/images/Words/brother.png`, audioEnglishUrl: `${SUPABASE_BASE}/audio/words/Brother_eng.mp3`, audioTotoUrl: `${SUPABASE_BASE}/audio/words/Brother_toto.mp3` },
    { id: 'w-cat', english: 'Cat', category: 'Animals', imageUrl: `${SUPABASE_BASE}/images/Words/cat.png`, audioEnglishUrl: `${SUPABASE_BASE}/audio/words/Cat_eng.mp3`, audioTotoUrl: `${SUPABASE_BASE}/audio/words/Cat_toto.mp3` },
    { id: 'w-cloud', english: 'Cloud', category: 'Nature', imageUrl: `${SUPABASE_BASE}/images/Words/cloud.png`, audioEnglishUrl: `${SUPABASE_BASE}/audio/words/Cloud_eng.mp3`, audioTotoUrl: `${SUPABASE_BASE}/audio/words/Cloud_toto.mp3` },
    { id: 'w-cow', english: 'Cow', category: 'Animals', imageUrl: `${SUPABASE_BASE}/images/Words/cow.png`, audioEnglishUrl: `${SUPABASE_BASE}/audio/words/Cow_eng.mp3`, audioTotoUrl: `${SUPABASE_BASE}/audio/words/Cow_toto.mp3` },
    { id: 'w-cry', english: 'Cry', category: 'Emotions', imageUrl: `${SUPABASE_BASE}/images/Words/cry.png`, audioEnglishUrl: `${SUPABASE_BASE}/audio/words/Cry_eng.mp3`, audioTotoUrl: `${SUPABASE_BASE}/audio/words/Cry_toto.mp3` },
    { id: 'w-dance', english: 'Dance', category: 'Actions', imageUrl: `${SUPABASE_BASE}/images/Words/dance.png`, audioEnglishUrl: `${SUPABASE_BASE}/audio/words/Dance_eng.mp3`, audioTotoUrl: `${SUPABASE_BASE}/audio/words/Dance_toto.mp3` },
    { id: 'w-dog', english: 'Dog', category: 'Animals', imageUrl: `${SUPABASE_BASE}/images/Words/dog.png`, audioEnglishUrl: `${SUPABASE_BASE}/audio/words/Dog_eng.mp3`, audioTotoUrl: `${SUPABASE_BASE}/audio/words/Dog_toto.mp3` },
    { id: 'w-drink', english: 'Drink', category: 'Actions', imageUrl: `${SUPABASE_BASE}/images/Words/drink.png`, audioEnglishUrl: `${SUPABASE_BASE}/audio/words/Dream_eng.mp3`, audioTotoUrl: `${SUPABASE_BASE}/audio/words/Dream_toto.mp3` },
    { id: 'w-ear', english: 'Ear', category: 'Body Parts', imageUrl: `${SUPABASE_BASE}/images/Words/ear.png`, audioEnglishUrl: `${SUPABASE_BASE}/audio/words/Ear_eng.mp3`, audioTotoUrl: `${SUPABASE_BASE}/audio/words/Ear_toto.mp3` },
    { id: 'w-eat', english: 'Eat', category: 'Actions', imageUrl: `${SUPABASE_BASE}/images/Words/eat.png`, audioEnglishUrl: `${SUPABASE_BASE}/audio/words/Eat_eng.mp3`, audioTotoUrl: `${SUPABASE_BASE}/audio/words/Eat_toto.mp3` },
    { id: 'w-egg', english: 'Egg', category: 'Food', imageUrl: `${SUPABASE_BASE}/images/Words/egg.png`, audioEnglishUrl: `${SUPABASE_BASE}/audio/words/Egg_eng.mp3`, audioTotoUrl: `${SUPABASE_BASE}/audio/words/Egg_toto.mp3` },
    { id: 'w-elephant', english: 'Elephant', category: 'Animals', imageUrl: `${SUPABASE_BASE}/images/Words/elephant.png`, audioEnglishUrl: `${SUPABASE_BASE}/audio/words/Elephant_eng.mp3`, audioTotoUrl: `${SUPABASE_BASE}/audio/words/Elephant_toto.mp3` },
    { id: 'w-eye', english: 'Eye', category: 'Body Parts', imageUrl: `${SUPABASE_BASE}/images/Words/eye.png`, audioEnglishUrl: `${SUPABASE_BASE}/audio/words/Eye_Eng.mp3`, audioTotoUrl: `${SUPABASE_BASE}/audio/words/Eye_toto.mp3` },
    { id: 'w-family', english: 'Family', category: 'Community', imageUrl: `${SUPABASE_BASE}/images/Words/family.png`, audioEnglishUrl: `${SUPABASE_BASE}/audio/words/Family_eng.mp3`, audioTotoUrl: `${SUPABASE_BASE}/audio/words/Family_toto.mp3` },
    { id: 'w-father', english: 'Father', category: 'Family', imageUrl: `${SUPABASE_BASE}/images/Words/father.png`, audioEnglishUrl: `${SUPABASE_BASE}/audio/words/Father_eng.mp3`, audioTotoUrl: `${SUPABASE_BASE}/audio/words/Father_toto.mp3` },
    { id: 'w-field', english: 'Field', category: 'Places', imageUrl: `${SUPABASE_BASE}/images/Words/field.png`, audioEnglishUrl: `${SUPABASE_BASE}/audio/words/Field_eng.mp3`, audioTotoUrl: `${SUPABASE_BASE}/audio/words/Field_toto.mp3` },
    { id: 'w-fire', english: 'Fire', category: 'Nature', imageUrl: `${SUPABASE_BASE}/images/Words/fire.png`, audioEnglishUrl: `${SUPABASE_BASE}/audio/words/Fire_Eng.mp3`, audioTotoUrl: `${SUPABASE_BASE}/audio/words/Fire_toto.mp3` },
    { id: 'w-fish', english: 'Fish', category: 'Animals', imageUrl: `${SUPABASE_BASE}/images/Words/fish.png`, audioEnglishUrl: `${SUPABASE_BASE}/audio/words/Fish_eng.mp3`, audioTotoUrl: `${SUPABASE_BASE}/audio/words/Fish_toto.mp3` },
    { id: 'w-flower', english: 'Flower', category: 'Nature', imageUrl: `${SUPABASE_BASE}/images/Words/flower.png`, audioEnglishUrl: `${SUPABASE_BASE}/audio/words/Flower_eng.mp3`, audioTotoUrl: `${SUPABASE_BASE}/audio/words/Flower_toto.mp3` },
    { id: 'w-foot', english: 'Foot', category: 'Body Parts', imageUrl: `${SUPABASE_BASE}/images/Words/foot.png`, audioEnglishUrl: `${SUPABASE_BASE}/audio/words/Foot_eng.mp3`, audioTotoUrl: `${SUPABASE_BASE}/audio/words/Foot_toto.mp3` },
    { id: 'w-forest', english: 'Forest', category: 'Places', imageUrl: `${SUPABASE_BASE}/images/Words/forest.png`, audioEnglishUrl: `${SUPABASE_BASE}/audio/words/Forest_eng.mp3`, audioTotoUrl: `${SUPABASE_BASE}/audio/words/Forest_toto.mp3` },
    { id: 'w-frog', english: 'Frog', category: 'Animals', imageUrl: `${SUPABASE_BASE}/images/Words/frog.png`, audioEnglishUrl: `${SUPABASE_BASE}/audio/words/Frog_eng.mp3`, audioTotoUrl: `${SUPABASE_BASE}/audio/words/Frog_toto.mp3` },
    { id: 'w-goat', english: 'Goat', category: 'Animals', imageUrl: `${SUPABASE_BASE}/images/Words/goat.png`, audioEnglishUrl: `${SUPABASE_BASE}/audio/words/Got_eng.mp3`, audioTotoUrl: `${SUPABASE_BASE}/audio/words/Got_toto.mp3` },
    { id: 'w-hand', english: 'Hand', category: 'Body Parts', imageUrl: `${SUPABASE_BASE}/images/Words/hand.png`, audioEnglishUrl: `${SUPABASE_BASE}/audio/words/Hand_eng.mp3`, audioTotoUrl: `${SUPABASE_BASE}/audio/words/Hand_toto.mp3` },
    { id: 'w-happy', english: 'Happy', category: 'Emotions', imageUrl: `${SUPABASE_BASE}/images/Words/happy.png`, audioEnglishUrl: `${SUPABASE_BASE}/audio/words/Happy_eng.mp3`, audioTotoUrl: `${SUPABASE_BASE}/audio/words/Happy_toto.mp3` },
    { id: 'w-head', english: 'Head', category: 'Body Parts', imageUrl: `${SUPABASE_BASE}/images/Words/head.png`, audioEnglishUrl: `${SUPABASE_BASE}/audio/words/Head_eng.mp3`, audioTotoUrl: `${SUPABASE_BASE}/audio/words/Head_Toto.mp3` },
    { id: 'w-heart', english: 'Heart', category: 'Body Parts', imageUrl: `${SUPABASE_BASE}/images/Words/heart.png`, audioEnglishUrl: `${SUPABASE_BASE}/audio/words/Heart_eng.mp3`, audioTotoUrl: `${SUPABASE_BASE}/audio/words/Heart_toto.mp3` },
    { id: 'w-home', english: 'Home', category: 'Places', imageUrl: `${SUPABASE_BASE}/images/Words/house.png`, audioEnglishUrl: `${SUPABASE_BASE}/audio/words/Home_eng.mp3`, audioTotoUrl: `${SUPABASE_BASE}/audio/words/Home_toto.mp3` },
    { id: 'w-jump', english: 'Jump', category: 'Actions', imageUrl: `${SUPABASE_BASE}/images/Words/jump.png`, audioEnglishUrl: `${SUPABASE_BASE}/audio/words/Jump_eng.mp3`, audioTotoUrl: `${SUPABASE_BASE}/audio/words/Jump_toto.mp3` },
    { id: 'w-laugh', english: 'Laugh', category: 'Emotions', imageUrl: `${SUPABASE_BASE}/images/Words/laugh.png`, audioEnglishUrl: `${SUPABASE_BASE}/audio/words/Love_eng.mp3`, audioTotoUrl: `${SUPABASE_BASE}/audio/words/Love_toto.mp3` },
    { id: 'w-leaf', english: 'Leaf', category: 'Nature', imageUrl: `${SUPABASE_BASE}/images/Words/leaf.png`, audioEnglishUrl: `${SUPABASE_BASE}/audio/words/Live_eng.mp3`, audioTotoUrl: `${SUPABASE_BASE}/audio/words/Live_toto.mp3` },
    { id: 'w-leg', english: 'Leg', category: 'Body Parts', imageUrl: `${SUPABASE_BASE}/images/Words/leg.png`, audioEnglishUrl: `${SUPABASE_BASE}/audio/words/Leg_Eng.mp3`, audioTotoUrl: `${SUPABASE_BASE}/audio/words/Leg_toto.mp3` },
    { id: 'w-market', english: 'Market', category: 'Places', imageUrl: `${SUPABASE_BASE}/images/Words/market.png`, audioEnglishUrl: `${SUPABASE_BASE}/audio/words/Market_eng.mp3`, audioTotoUrl: `${SUPABASE_BASE}/audio/words/Market_toto.mp3` },
    { id: 'w-milk', english: 'Milk', category: 'Food', imageUrl: `${SUPABASE_BASE}/images/Words/MILK.png`, audioEnglishUrl: `${SUPABASE_BASE}/audio/words/Milk_eng.mp3`, audioTotoUrl: `${SUPABASE_BASE}/audio/words/Milk_toto.mp3` },
    { id: 'w-moon', english: 'Moon', category: 'Nature', imageUrl: `${SUPABASE_BASE}/images/Words/moon.png`, audioEnglishUrl: `${SUPABASE_BASE}/audio/words/Moon_english.mp3`, audioTotoUrl: `${SUPABASE_BASE}/audio/words/Moon_toto.mp3` },
    { id: 'w-mountain', english: 'Mountain', category: 'Nature', imageUrl: `${SUPABASE_BASE}/images/Words/mountains.png`, audioEnglishUrl: `${SUPABASE_BASE}/audio/words/Mountain_eng.mp3`, audioTotoUrl: `${SUPABASE_BASE}/audio/words/Mountain_toto.mp3` },
    { id: 'w-mouth', english: 'Mouth', category: 'Body Parts', imageUrl: `${SUPABASE_BASE}/images/Words/mouth.png`, audioEnglishUrl: `${SUPABASE_BASE}/audio/words/Mouth_eng.mp3`, audioTotoUrl: `${SUPABASE_BASE}/audio/words/Mouth_toto.mp3` },
    { id: 'w-nose', english: 'Nose', category: 'Body Parts', imageUrl: `${SUPABASE_BASE}/images/Words/nose.png`, audioEnglishUrl: `${SUPABASE_BASE}/audio/words/Nose_eng.mp3`, audioTotoUrl: `${SUPABASE_BASE}/audio/words/Nose_toto.mp3` },
    { id: 'w-rain', english: 'Rain', category: 'Nature', imageUrl: `${SUPABASE_BASE}/images/Words/rain.png`, audioEnglishUrl: `${SUPABASE_BASE}/audio/words/Rain_eng.mp3`, audioTotoUrl: `${SUPABASE_BASE}/audio/words/Rain_toto.mp3` },
    { id: 'w-rice', english: 'Rice', category: 'Food', imageUrl: `${SUPABASE_BASE}/images/Words/rice.png`, audioEnglishUrl: `${SUPABASE_BASE}/audio/words/Rice_eng.mp3`, audioTotoUrl: `${SUPABASE_BASE}/audio/words/Rice_toto.mp3` },
    { id: 'w-river', english: 'River', category: 'Nature', imageUrl: `${SUPABASE_BASE}/images/Words/river.png`, audioEnglishUrl: `${SUPABASE_BASE}/audio/words/River_eng.mp3`, audioTotoUrl: `${SUPABASE_BASE}/audio/words/River_toto.mp3` },
    { id: 'w-riverbank', english: 'Riverbank', category: 'Places', imageUrl: `${SUPABASE_BASE}/images/Words/riverbank.png`, audioEnglishUrl: `${SUPABASE_BASE}/audio/words/Riverbank_eng.mp3`, audioTotoUrl: `${SUPABASE_BASE}/audio/words/Riverbank_toto.mp3` },
    { id: 'w-run', english: 'Run', category: 'Actions', imageUrl: `${SUPABASE_BASE}/images/Words/RUN.png`, audioEnglishUrl: `${SUPABASE_BASE}/audio/words/Run_eng.mp3`, audioTotoUrl: `${SUPABASE_BASE}/audio/words/Run_toto.mp3` },
    { id: 'w-sad', english: 'Sad', category: 'Emotions', imageUrl: `${SUPABASE_BASE}/images/Words/SAD.png`, audioEnglishUrl: `${SUPABASE_BASE}/audio/words/Sad_eng.mp3`, audioTotoUrl: `${SUPABASE_BASE}/audio/words/Sad_toto.mp3` },
    { id: 'w-salt', english: 'Salt', category: 'Food', imageUrl: `${SUPABASE_BASE}/images/Words/salt.png`, audioEnglishUrl: `${SUPABASE_BASE}/audio/words/Salt_eng.mp3`, audioTotoUrl: `${SUPABASE_BASE}/audio/words/Salt_toto.mp3` },
    { id: 'w-school', english: 'School', category: 'Places', imageUrl: `${SUPABASE_BASE}/images/Words/school.png`, audioEnglishUrl: `${SUPABASE_BASE}/audio/words/School_eng.mp3`, audioTotoUrl: `${SUPABASE_BASE}/audio/words/School_toto.mp3` },
    { id: 'w-sister', english: 'Sister', category: 'Family', imageUrl: `${SUPABASE_BASE}/images/Words/sister.png`, audioEnglishUrl: `${SUPABASE_BASE}/audio/words/Sister_eng.mp3`, audioTotoUrl: `${SUPABASE_BASE}/audio/words/Sister_toto.mp3` },
    { id: 'w-sit', english: 'Sit', category: 'Actions', imageUrl: `${SUPABASE_BASE}/images/Words/sit.png`, audioEnglishUrl: `${SUPABASE_BASE}/audio/words/Sit_eng.mp3`, audioTotoUrl: `${SUPABASE_BASE}/audio/words/Sit_toto.mp3` },
    { id: 'w-sleep', english: 'Sleep', category: 'Actions', imageUrl: `${SUPABASE_BASE}/images/Words/sleep.png`, audioEnglishUrl: `${SUPABASE_BASE}/audio/words/Sleep_eng.mp3`, audioTotoUrl: `${SUPABASE_BASE}/audio/words/Sleep_toto.mp3` },
    { id: 'w-stand', english: 'Stand', category: 'Actions', imageUrl: `${SUPABASE_BASE}/images/Words/stand.png`, audioEnglishUrl: `${SUPABASE_BASE}/audio/words/Stand_eng.mp3`, audioTotoUrl: `${SUPABASE_BASE}/audio/words/Stand_toto.mp3` },
    { id: 'w-star', english: 'Star', category: 'Nature', imageUrl: `${SUPABASE_BASE}/images/Words/star%20(1).png`, audioEnglishUrl: `${SUPABASE_BASE}/audio/words/Star_eng.mp3`, audioTotoUrl: `${SUPABASE_BASE}/audio/words/Star_toto.mp3` },
    { id: 'w-stomach', english: 'Stomach', category: 'Body Parts', imageUrl: `${SUPABASE_BASE}/images/Words/stomach.png`, audioEnglishUrl: `${SUPABASE_BASE}/audio/words/Stomach_eng.mp3`, audioTotoUrl: `${SUPABASE_BASE}/audio/words/Stomach_toto.mp3` },
    { id: 'w-sugar', english: 'Sugar', category: 'Food', imageUrl: `${SUPABASE_BASE}/images/Words/sugar.png`, audioEnglishUrl: `${SUPABASE_BASE}/audio/words/Sugar_eng.mp3`, audioTotoUrl: `${SUPABASE_BASE}/audio/words/Sugar_toto.mp3` },
    { id: 'w-sun', english: 'Sun', category: 'Nature', imageUrl: `${SUPABASE_BASE}/images/Words/sun.png`, audioEnglishUrl: `${SUPABASE_BASE}/audio/words/Sun_eng.mp3`, audioTotoUrl: `${SUPABASE_BASE}/audio/words/Sun_toto.mp3` },
    { id: 'w-tree', english: 'Tree', category: 'Nature', imageUrl: `${SUPABASE_BASE}/images/Words/tree.png`, audioEnglishUrl: `${SUPABASE_BASE}/audio/words/Tree_eng.mp3`, audioTotoUrl: `${SUPABASE_BASE}/audio/words/Tree_toto.mp3` },
    { id: 'w-village', english: 'Village', category: 'Community', imageUrl: `${SUPABASE_BASE}/images/Words/village.png`, audioEnglishUrl: `${SUPABASE_BASE}/audio/words/Village_eng.mp3`, audioTotoUrl: `${SUPABASE_BASE}/audio/words/Village_toto.mp3` },
    { id: 'w-walk', english: 'Walk', category: 'Actions', imageUrl: `${SUPABASE_BASE}/images/Words/walk.png`, audioEnglishUrl: `${SUPABASE_BASE}/audio/words/Walk_eng.mp3`, audioTotoUrl: `${SUPABASE_BASE}/audio/words/Walk_toto.mp3` },
    { id: 'w-water', english: 'Water', category: 'Nature', imageUrl: `${SUPABASE_BASE}/images/Words/water.png`, audioEnglishUrl: `${SUPABASE_BASE}/audio/words/Water_eng.mp3`, audioTotoUrl: `${SUPABASE_BASE}/audio/words/Water_toto.mp3` },
];

/** Get words by category */
export function getWordsByCategory(category: string): WordItem[] {
    return ALL_WORDS.filter(w => w.category === category);
}

/** Get the "Word of the Day" based on the current date */
export function getWordOfTheDay(): WordItem {
    const dayIndex = Math.floor(Date.now() / 86400000) % ALL_WORDS.length;
    return ALL_WORDS[dayIndex];
}

/** Get category counts */
export function getCategoryCounts(): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const w of ALL_WORDS) {
        counts[w.category] = (counts[w.category] || 0) + 1;
    }
    return counts;
}
