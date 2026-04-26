// ─────────────────────────────────────────────────────────────
// Toto Language — Bengali Script Lookup Map
// Source: "toto translation data_bengali.xlsx" (Sheet2)
// Key: English word (lowercase), Value: Toto in Bengali script
// ─────────────────────────────────────────────────────────────

export const TOTO_BENGALI: Record<string, string> = {
    // Emotions
    angry: 'সেদাং',
    happy: 'য়াংতাওয়া',
    sad: 'মোহমেপা',
    cry: 'কাংওয়া',
    laugh: 'লেংওয়া',

    // Food
    apple: 'আপেল',
    banana: 'উইপি',
    bread: 'কোবরেঙ',
    egg: 'কুইতু',
    milk: 'ইয়ুতি',
    rice: 'আমা',
    salt: 'নি',
    sugar: 'চিনি',
    corn: 'সেংজা',
    tea: 'চাসিঙ',
    potato: 'বেতারু',
    chili: 'মুরি',
    curd: 'দ ই',
    oil: 'চুতি',
    honey: 'মোহ',
    onion: 'পেয়াজি',
    garlic: 'মাইসাই',
    pumpkin: 'পাগুরুসে',
    cucumber: 'সূওয়া',
    lemon: 'জামসে',
    meat: 'বেয়া/বিয়া',

    // Animals
    bird: 'ঝিয়া',
    cat: 'মিংকি',
    cow: 'পিকা',
    dog: 'খিয়া',
    elephant: 'লেং গুচেংমা',
    fish: 'ন্যায়া',
    frog: 'তাইয়া',
    goat: 'এতা',
    hen: 'কেকা',
    duck: 'হাঙসা',
    monkey: 'নোকা',
    butterfly: 'ভুইবুসি',

    // Family
    brother: 'এয়',
    father: 'আপা',
    sister: 'এমে',

    // Community
    family: 'মাঙ',
    village: 'লোইয়',

    // Places
    field: 'নিয়াং',
    forest: 'চুংচা',
    home: 'সা',
    market: 'হাতি',
    riverbank: 'জোরা কো আলি',
    school: 'ইস্কুল',
    garden: 'বাগান',
    shop: 'দোকেই',
    kitchen: 'কিচেন',

    // Nature
    cloud: 'মুউদুই',
    fire: 'মে',
    flower: 'মাইবে',
    leaf: 'লাপা',
    moon: 'তারি',
    mountain: 'য়াঘোয়',
    rain: 'ওয়াতি',
    river: 'জোরা/নুবেই',
    star: 'পুইমা',
    sun: 'সানি',
    tree: 'সেংটেই',
    water: 'তি',
    stone: 'লুইয়টুয়',
    grass: 'স্যামা',
    sand: 'বালুওয়া',
    hill: 'য়্যাঘো',

    // Body Parts
    ear: 'নানুউ',
    eye: 'মিচো',
    foot: 'তাংবা',
    hand: 'খুঙ',
    head: 'পরো',
    heart: 'তুঙসিং',
    leg: 'কোকোই',
    mouth: 'নামু',
    nose: 'নোবে',
    stomach: 'প্যমা',
    hair: 'পুরিং',
    face: 'ইউয়াই',
    tooth: 'সেটাং',
    tongue: 'লেবে',
    neck: 'নেটং',
    finger: 'কোরে',
    back: 'নুইনু',
    knee: 'চোতঙ',
    shoulder: 'বুচুঙ',
    skin: 'বেকং',

    // Actions
    dance: 'য়োংওয়া',
    drink: 'আংওয়া',
    eat: 'চাওয়া',
    jump: 'টোইওয়া',
    run: 'ঠুওয়া',
    sit: 'গা',
    sleep: 'জিঙ',
    stand: 'জা',
    walk: 'তেংওয়া',
    play: 'কালাইওয়া',
    cook: 'কিংওয়া',
    wash: 'দুওয়া',
    listen: 'হিংওয়া',
    look: 'কাঙ',
    sing: 'লেহদি',
    read: 'পারাইওয়া',
    write: 'লাওয়া',
    draw: 'আকেওয়া',
    open: 'হোইওয়া',
    close: 'গিওয়া',
    give: 'পিচ ওয়া',
    take: 'উঈচ ওয়া',
    pull: 'ডাইওয়া',
    push: 'জুইওয়া',
    climb: 'লোইয়া',
    carry: 'পুওয়া',
    harvest: 'তিংওয়া',
    remember: 'লেপাতা এওয়া',
    weaving: 'চেংওয়া',
    gather: 'তাংসা',

    // Objects
    plate: 'বারাঙ',
    spoon: 'চামচি',
    cup: 'কাপ',
    knife: 'কাতরি',
    broom: 'ঝাড়ু',
    mat: 'চাটাই',
    shirt: 'শার্ট',
    lamp: 'বাতি',
    table: 'টেবিল',
    chair: 'চেয়ার',
    box: 'বাকসি',
    bag: 'ঠিওয়া',
    bottle: 'বোতল',
    bucket: 'বালতি',
    soap: 'সাবুন',
    comb: 'বিদা',
    rope: 'পারদি',
    stick: 'দোং',
    shoes: 'জুতা',

    // Colors
    red: 'আলুওয়া',
    blue: 'য়োইনিওয়া',
    green: 'হোয়ইনিওয়া',
    yellow: 'ইউবা',
    black: 'দাসিওয়া',
    white: 'হাঙপাওয়া',
};

/**
 * Get the Toto (Bengali script) translation for an English word.
 * Returns the Bengali-script Toto word, or falls back to the
 * provided latin Toto word, or the English word itself.
 */
export function getTotoBengali(english: string, latinToto?: string): string {
    const key = english.toLowerCase().trim();
    return TOTO_BENGALI[key] ?? latinToto ?? english;
}
