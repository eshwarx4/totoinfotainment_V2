/**
 * Emoji map for words — used as visual fallback when images are missing.
 * Maps English word (lowercase) → emoji.
 */
const WORD_EMOJI_MAP: Record<string, string> = {
    // Animals
    dog: '🐕',
    cat: '🐱',
    bird: '🐦',
    cow: '🐄',
    goat: '🐐',
    chicken: '🐔',
    fish: '🐟',
    elephant: '🐘',
    tiger: '🐯',
    monkey: '🐒',
    snake: '🐍',
    frog: '🐸',
    horse: '🐴',
    pig: '🐷',
    rabbit: '🐇',
    deer: '🦌',
    bear: '🐻',
    // Food
    apple: '🍎',
    rice: '🍚',
    banana: '🍌',
    mango: '🥭',
    potato: '🥔',
    tomato: '🍅',
    onion: '🧅',
    corn: '🌽',
    bread: '🍞',
    milk: '🥛',
    egg: '🥚',
    meat: '🥩',
    fish_food: '🐟',
    salt: '🧂',
    sugar: '🍬',
    // Nature
    water: '💧',
    sun: '☀️',
    moon: '🌙',
    star: '⭐',
    rain: '🌧️',
    fire: '🔥',
    mountain: '🏔️',
    river: '🏞️',
    cloud: '☁️',
    wind: '💨',
    earth: '🌍',
    sky: '🌤️',
    stone: '🪨',
    flower: '🌸',
    tree: '🌳',
    leaf: '🍃',
    grass: '🌿',
    // Body
    hand: '🤚',
    eye: '👁️',
    ear: '👂',
    nose: '👃',
    mouth: '👄',
    head: '🗣️',
    foot: '🦶',
    leg: '🦵',
    finger: '☝️',
    tooth: '🦷',
    hair: '💇',
    face: '😊',
    heart: '❤️',
    // Objects
    book: '📖',
    house: '🏠',
    door: '🚪',
    table: '🪑',
    pot: '🍲',
    basket: '🧺',
    clothes: '👕',
    shoe: '👟',
    knife: '🔪',
    plate: '🍽️',
    cup: '☕',
    candle: '🕯️',
    key: '🔑',
    bed: '🛏️',
    chair: '🪑',
    broom: '🧹',
    rope: '🪢',
};

/**
 * Get emoji for a word. Falls back to a category emoji if no exact match.
 */
export function getWordEmoji(english: string, category?: string): string {
    const key = english.toLowerCase().trim();
    if (WORD_EMOJI_MAP[key]) return WORD_EMOJI_MAP[key];

    // Category fallbacks
    const categoryEmojis: Record<string, string> = {
        Animals: '🐾',
        Food: '🍴',
        Nature: '🌿',
        Body: '🫶',
        Objects: '📦',
        Plants: '🌱',
    };

    if (category && categoryEmojis[category]) return categoryEmojis[category];
    return '📝';
}

/**
 * Generate a data URL for an emoji-based SVG image.
 * Used as fallback when real images are missing.
 */
export function getEmojiImageUrl(english: string, category?: string): string {
    const emoji = getWordEmoji(english, category);
    // Create an SVG with the emoji centered on a soft colored background
    const bgColors: Record<string, string> = {
        Animals: '#E8F5E9',
        Food: '#FFF3E0',
        Nature: '#E3F2FD',
        Body: '#FCE4EC',
        Objects: '#F3E5F5',
        Plants: '#E8F5E9',
    };
    const bg = category && bgColors[category] ? bgColors[category] : '#F5F5F5';

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
    <rect width="200" height="200" rx="20" fill="${bg}"/>
    <text x="100" y="115" font-size="80" text-anchor="middle" dominant-baseline="middle">${emoji}</text>
  </svg>`;

    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
