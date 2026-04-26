// ==========================================
// LOCAL CONCEPTS - sourced from Concepts_2.csv
// Slides shape mirrors ConceptSlideRow so ConceptViewer can render them.
// ==========================================

import type { ConceptSlideRow } from '@/lib/supabaseQueries';

export interface LocalConcept {
    id: string;
    title: string;
    emoji: string;
    slides: ConceptSlideRow[];
}

function makeSlide(
    conceptId: string,
    n: number,
    scene: string,
    english: string,
    audioEng: string,
    audioToto: string,
    image: string,
): ConceptSlideRow {
    return {
        id: `${conceptId}-s${n}`,
        concept_id: conceptId,
        slide_number: n,
        scene_description: scene,
        english_narration: english,
        toto_narration: null,
        notes: null,
        file_name_eng: null,
        file_name_toto: null,
        audio_english_url: audioEng || null,
        audio_toto_url: audioToto || null,
        image_url: image || null,
        created_at: '',
        updated_at: '',
    };
}

const COOKING_RICE = 'concept-cooking-rice';
const BUTTERFLY = 'concept-butterfly-life';
const HONEYBEE = 'concept-honeybee';

export const LOCAL_CONCEPTS: LocalConcept[] = [
    {
        id: COOKING_RICE,
        title: 'Cooking Rice',
        emoji: '🍚',
        slides: [
            makeSlide(COOKING_RICE, 1,
                'Raw rice grains in a bowl',
                'This is dry, hard rice.',
                'https://ryxeculvhjqugxaqscui.supabase.co/storage/v1/object/public/audio/Concepts_2/Cooking%20Rice/this%20is%20dry%20hard%20rice%20(eng).mp3',
                'https://ryxeculvhjqugxaqscui.supabase.co/storage/v1/object/public/audio/Concepts_2/Cooking%20Rice/this%20is%20dry%20hard%20rice%20(toto).mp3',
                'https://ryxeculvhjqugxaqscui.supabase.co/storage/v1/object/public/images/concepts_2/cooking%20rice/Raw%20rice%20grains%20in%20a%20bowl.png',
            ),
            makeSlide(COOKING_RICE, 2,
                'Pot of boiling water',
                'We boil the rice in hot water.',
                'https://ryxeculvhjqugxaqscui.supabase.co/storage/v1/object/public/audio/Concepts_2/Cooking%20Rice/we%20boil%20the%20rice%20in%20hot%20water%20(eng).mp3',
                'https://ryxeculvhjqugxaqscui.supabase.co/storage/v1/object/public/audio/Concepts_2/Cooking%20Rice/we%20boil%20rice%20in%20hot%20water%20(toto).mp3',
                'https://ryxeculvhjqugxaqscui.supabase.co/storage/v1/object/public/images/concepts_2/cooking%20rice/Pot%20of%20boiling%20water.png',
            ),
            makeSlide(COOKING_RICE, 3,
                'Plate of cooked rice',
                'Now the rice is soft and good to eat.',
                'https://ryxeculvhjqugxaqscui.supabase.co/storage/v1/object/public/audio/Concepts_2/Cooking%20Rice/now%20the%20rice%20(eng).mp3',
                'https://ryxeculvhjqugxaqscui.supabase.co/storage/v1/object/public/audio/Concepts_2/Cooking%20Rice/now%20the%20rice%20(toto).mp3',
                'https://ryxeculvhjqugxaqscui.supabase.co/storage/v1/object/public/images/concepts_2/cooking%20rice/plate%20of%20cooked%20rice.png',
            ),
        ],
    },
    {
        id: BUTTERFLY,
        title: "The Butterfly's Life",
        emoji: '🦋',
        slides: [
            makeSlide(BUTTERFLY, 1,
                'A hungry caterpillar eating a green leaf',
                'A small caterpillar eats many green leaves.',
                "https://ryxeculvhjqugxaqscui.supabase.co/storage/v1/object/public/audio/Concepts_2/The%20Butterfly's%20Life/small%20caterpillar%20(eng).mp3",
                "https://ryxeculvhjqugxaqscui.supabase.co/storage/v1/object/public/audio/Concepts_2/The%20Butterfly's%20Life/small%20caterpillar%20(toto).mp3",
                'https://ryxeculvhjqugxaqscui.supabase.co/storage/v1/object/public/images/concepts_2/butterfly/hungry%20caterpillar.png',
            ),
            makeSlide(BUTTERFLY, 2,
                'A cocoon hanging quietly from a branch',
                'It builds a small house and goes to sleep inside.',
                "https://ryxeculvhjqugxaqscui.supabase.co/storage/v1/object/public/audio/Concepts_2/The%20Butterfly's%20Life/it%20builds%20a%20small%20(eng).mp3",
                "https://ryxeculvhjqugxaqscui.supabase.co/storage/v1/object/public/audio/Concepts_2/The%20Butterfly's%20Life/it%20builds%20a%20small%20(toto).mp3",
                'https://ryxeculvhjqugxaqscui.supabase.co/storage/v1/object/public/images/concepts_2/butterfly/coccoon.png',
            ),
            makeSlide(BUTTERFLY, 3,
                'A colorful butterfly flying out',
                'When it wakes up, it has wings! It is a butterfly.',
                "https://ryxeculvhjqugxaqscui.supabase.co/storage/v1/object/public/audio/Concepts_2/The%20Butterfly's%20Life/when%20it%20wakes%20up%20(eng).mp3",
                "https://ryxeculvhjqugxaqscui.supabase.co/storage/v1/object/public/audio/Concepts_2/The%20Butterfly's%20Life/when%20it%20wakes%20up%20(toto).mp3",
                'https://ryxeculvhjqugxaqscui.supabase.co/storage/v1/object/public/images/concepts_2/butterfly/butterfly.png',
            ),
        ],
    },
    {
        id: HONEYBEE,
        title: 'The Busy Honeybee',
        emoji: '🐝',
        slides: [
            makeSlide(HONEYBEE, 1,
                'A bee sitting on a bright flower',
                'The busy bee finds a flower and drinks sweet juice.',
                'https://ryxeculvhjqugxaqscui.supabase.co/storage/v1/object/public/audio/Concepts_2/The%20Busy%20Honeybee/the%20busy%20bee%20(eng).mp3',
                'https://ryxeculvhjqugxaqscui.supabase.co/storage/v1/object/public/audio/Concepts_2/The%20Busy%20Honeybee/the%20busy%20bee%20(toto).mp3',
                'https://ryxeculvhjqugxaqscui.supabase.co/storage/v1/object/public/images/concepts_2/honeybee/honeybee.png',
            ),
            makeSlide(HONEYBEE, 2,
                'A beehive hanging on a tree',
                'It flies back to its home called a hive.',
                'https://ryxeculvhjqugxaqscui.supabase.co/storage/v1/object/public/audio/Concepts_2/The%20Busy%20Honeybee/it%20flies%20back%20(eng).mp3',
                'https://ryxeculvhjqugxaqscui.supabase.co/storage/v1/object/public/audio/Concepts_2/The%20Busy%20Honeybee/it%20flies%20back%20(toto).mp3',
                'https://ryxeculvhjqugxaqscui.supabase.co/storage/v1/object/public/images/concepts_2/honeybee/beehive.png',
            ),
            makeSlide(HONEYBEE, 3,
                'A jar of honey',
                'The bees turn the juice into sweet, yellow honey.',
                'https://ryxeculvhjqugxaqscui.supabase.co/storage/v1/object/public/audio/Concepts_2/The%20Busy%20Honeybee/the%20bees%20turn%20(eng).mp3',
                'https://ryxeculvhjqugxaqscui.supabase.co/storage/v1/object/public/audio/Concepts_2/The%20Busy%20Honeybee/the%20bees%20turn%20(toto).mp3',
                'https://ryxeculvhjqugxaqscui.supabase.co/storage/v1/object/public/images/concepts_2/honeybee/honey.png',
            ),
        ],
    },
];

export function getLocalConcept(id: string): LocalConcept | undefined {
    return LOCAL_CONCEPTS.find(c => c.id === id);
}
