// ==========================================
// COMMUNITY FEED DATA
// Easily editable — add/remove posts here
// ==========================================

export interface CommunityPost {
  id: string;
  image: string;
  title: string;
  description: string;
  timestamp: string;
  likes: number;
  tag?: string;
}

const COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: 'post_001',
    image: '/images/stories/evaporation.png',
    title: 'Totopara Village Life',
    description: 'A glimpse into the daily life of the Toto community in Totopara, nestled in the foothills of the Himalayas near the Bhutan border.',
    timestamp: '2 days ago',
    likes: 24,
    tag: 'Culture',
  },
  {
    id: 'post_002',
    image: '/images/stories/plant-growth.png',
    title: 'Traditional Toto Festival',
    description: 'The Toto community celebrates their harvest festival with traditional songs, dances, and feasts that bring the whole village together.',
    timestamp: '5 days ago',
    likes: 42,
    tag: 'Festival',
  },
  {
    id: 'post_003',
    image: '/images/words/sun.png',
    title: 'Toto Language Workshop',
    description: 'Young members of the community learning to read and write in Toto during a language preservation workshop organized by elders.',
    timestamp: '1 week ago',
    likes: 31,
    tag: 'Education',
  },
  {
    id: 'post_004',
    image: '/images/words/apple.png',
    title: 'Traditional Toto Cuisine',
    description: 'Traditional Toto food prepared during community gatherings using locally grown ingredients from the hills of Totopara.',
    timestamp: '2 weeks ago',
    likes: 18,
    tag: 'Food',
  },
  {
    id: 'post_005',
    image: '/images/words/water.png',
    title: 'Rivers of Totopara',
    description: 'The Torsha river flows alongside the Toto settlement, playing a central role in community life, farming, and cultural rituals.',
    timestamp: '2 weeks ago',
    likes: 37,
    tag: 'Nature',
  },
  {
    id: 'post_006',
    image: '/images/stories/evaporation.png',
    title: 'Preserving Toto Heritage',
    description: 'With fewer than 2,000 speakers remaining, the Toto community works tirelessly to document and pass on their language to younger generations.',
    timestamp: '3 weeks ago',
    likes: 55,
    tag: 'Heritage',
  },
];

export default COMMUNITY_POSTS;
