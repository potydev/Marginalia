import type { Vocabulary } from '@/payload-types'

export const fallbackVocabulary: Vocabulary[] = [
  {
    id: 'vocab-1',
    word: '木漏れ日',
    reading: 'こもれび',
    romanization: 'komorebi',
    meaning:
      'Sunlight filtering through the leaves of trees, creating shifting patterns of light and shadow.',
    language: 'japanese',
    status: 'learning',
    level: 'N4',
    tags: [{ label: 'nature' }, { label: 'untranslatable' }],
    examples: [
      {
        id: 'ex-1',
        sentence: '窓を開けると、机の上に木漏れ日が静かに落ちていた。',
        reading: 'Mado o akeru to, tsukue no ue ni komorebi ga shizuka ni ochite ita.',
        translation:
          'When I opened the window, sunlight filtering through the trees fell quietly onto my desk.',
      },
      {
        id: 'ex-2',
        sentence: '木漏れ日の下で、午後の本をゆっくり読んだ。',
        reading: 'Komorebi no shita de, gogo no hon o yukkuri yonda.',
        translation: 'Under the dappled sunlight, I leisurely read through my afternoon book.',
      },
    ],
    etymology:
      'Compound of 木 (ko, tree) + 漏れ (more, leaking/filtering through) + 日 (hi/bi, sun/light).',
    source: 'The Café on a Rainy Day, page 12',
    conjugations: [
      { id: 'c-1', form: 'Noun form', value: '木漏れ日 (komorebi)' },
      { id: 'c-2', form: 'With particle が', value: '木漏れ日が (komorebi ga)' },
      { id: 'c-3', form: 'With particle の', value: '木漏れ日の (komorebi no)' },
    ],
    createdAt: '2026-09-20T08:00:00.000Z',
    updatedAt: '2026-10-17T09:30:00.000Z',
  },
  {
    id: 'vocab-2',
    word: '寄り道',
    reading: 'よりみち',
    romanization: 'yorimichi',
    meaning: 'A detour; making an unplanned stop somewhere on the way home or to a destination.',
    language: 'japanese',
    status: 'known',
    level: 'N4',
    tags: [{ label: 'daily life' }, { label: 'travel' }],
    examples: [
      {
        id: 'ex-3',
        sentence: '仕事の帰りに、駅前の古本屋へ少し寄り道をした。',
        reading: 'Shigoto no kaeri ni, ekimae no furuhonya e sukoshi yorimichi o shita.',
        translation:
          'On my way back from work, I made a short detour to the secondhand bookshop by the station.',
      },
      {
        id: 'ex-4',
        sentence: '寄り道ばかりしていると、日が暮れてしまいますよ。',
        reading: 'Yorimichi bakari shite iru to, hi ga kurete shimaimasu yo.',
        translation: 'If you keep making detours, the sun will set before you know it.',
      },
    ],
    etymology:
      'From the verb 寄る (yoru, to drop by, approach) and 道 (michi, path, road). Implies wandering off the main route.',
    source: 'Conversation with Tanaka-san',
    conjugations: [
      { id: 'c-4', form: 'Suru-verb (plain)', value: '寄り道する (yorimichi suru)' },
      { id: 'c-5', form: 'Past form', value: '寄り道した (yorimichi shita)' },
      { id: 'c-6', form: 'Polite present', value: '寄り道します (yorimichi shimasu)' },
      { id: 'c-7', form: 'Te-form', value: '寄り道して (yorimichi shite)' },
    ],
    createdAt: '2026-09-24T14:15:00.000Z',
    updatedAt: '2026-10-15T18:00:00.000Z',
  },
  {
    id: 'vocab-3',
    word: 'たしかに',
    reading: 'たしかに',
    romanization: 'tashika ni',
    meaning:
      'Certainly; without a doubt; that is true (often used to concede a point before adding nuance).',
    language: 'japanese',
    status: 'learning',
    level: 'N4',
    tags: [{ label: 'conversation' }, { label: 'particles' }],
    examples: [
      {
        id: 'ex-5',
        sentence: 'たしかに、その考え方のほうが筋が通っていますね。',
        reading: 'Tashika ni, sono kangaekata no hō ga suji ga tōtte imasu ne.',
        translation: 'Certainly, that way of thinking makes more sense.',
      },
      {
        id: 'ex-6',
        sentence: 'たしかに昨日は寒かったが、今日は風が穏やかだ。',
        reading: 'Tashika ni kinō wa samukatta ga, kyō wa kaze ga odayaka da.',
        translation: 'It was certainly cold yesterday, but today the wind is gentle.',
      },
    ],
    etymology:
      'Adverbial form of the adjective 確か (tashika, sure, definite) with the adverb-forming particle に (ni).',
    source: 'NHK Easy News discussion',
    conjugations: [
      { id: 'c-8', form: 'Adverbial', value: 'たしかに (tashika ni)' },
      { id: 'c-9', form: 'Adjective form', value: 'たしかな (tashika na)' },
    ],
    createdAt: '2026-10-01T10:00:00.000Z',
    updatedAt: '2026-10-16T11:20:00.000Z',
  },
  {
    id: 'vocab-4',
    word: '勉強',
    reading: 'べんきょう',
    romanization: 'benkyō',
    meaning:
      'Study, diligence; learning from experience; also used idiomatically by merchants for giving a discount.',
    language: 'japanese',
    status: 'known',
    level: 'N5',
    tags: [{ label: 'study' }, { label: 'daily life' }],
    examples: [
      {
        id: 'ex-7',
        sentence: '毎朝二十分の勉強を欠かさず続けている。',
        reading: 'Maiasa nijuppun no benkyō o kakasazu tsuzukete iru.',
        translation: 'Every morning without fail, I keep up twenty minutes of study.',
      },
    ],
    etymology:
      'Historically composed of 勉 (ben, exertion, diligence) + 強 (kyō, forcing strength). Originates from striving against difficulty.',
    source: 'First textbook chapter',
    conjugations: [
      { id: 'c-10', form: 'Plain present', value: '勉強する (benkyō suru)' },
      { id: 'c-11', form: 'Past form', value: '勉強した (benkyō shita)' },
      { id: 'c-12', form: 'Te-form', value: '勉強して (benkyō shite)' },
    ],
    createdAt: '2026-08-30T07:00:00.000Z',
    updatedAt: '2026-09-15T09:00:00.000Z',
  },
  {
    id: 'vocab-5',
    word: '雨宿り',
    reading: 'あまやどり',
    romanization: 'amayadori',
    meaning:
      'Taking shelter from the rain under an awning, eaves, or inside an entrance until it passes.',
    language: 'japanese',
    status: 'new',
    level: 'N4',
    tags: [{ label: 'weather' }, { label: 'nature' }],
    examples: [
      {
        id: 'ex-8',
        sentence: '軒先で雨宿りをしながら、通り過ぎる車を眺めていた。',
        reading: 'Nokisaki de amayadori o shinagara, tōrisugiru kuruma o nagamete ita.',
        translation:
          'While sheltering from the rain under the eaves, I watched the cars passing by.',
      },
    ],
    etymology: '雨 (ama, rain) + 宿り (yadori, lodging/dwelling temporary shelter).',
    source: 'Short story: The Café on a Rainy Day',
    conjugations: [
      { id: 'c-13', form: 'Suru-verb', value: '雨宿りする (amayadori suru)' },
      { id: 'c-14', form: 'Past', value: '雨宿りした (amayadori shita)' },
    ],
    createdAt: '2026-10-10T12:00:00.000Z',
    updatedAt: '2026-10-16T15:00:00.000Z',
  },
  {
    id: 'vocab-6',
    word: '木陰',
    reading: 'こかげ',
    romanization: 'kokage',
    meaning: 'The cool shade provided by trees on a warm afternoon.',
    language: 'japanese',
    status: 'known',
    level: 'N4',
    tags: [{ label: 'nature' }],
    examples: [
      {
        id: 'ex-9',
        sentence: '公園の木陰にあるベンチに腰を下ろした。',
        reading: 'Kōen no kokage ni aru benchi ni koshi o oroshita.',
        translation: 'I sat down on a bench in the tree shade at the park.',
      },
    ],
    etymology: '木 (ko, tree) + 陰 (kage, shadow, shade).',
    source: 'Reading passage 2',
    conjugations: [{ id: 'c-15', form: 'Noun', value: '木陰 (kokage)' }],
    createdAt: '2026-09-18T10:00:00.000Z',
    updatedAt: '2026-10-02T16:00:00.000Z',
  },
  {
    id: 'vocab-7',
    word: '설레だ',
    reading: '설레다',
    romanization: 'seolleda',
    meaning: 'To flutter with pleasant anticipation or nervous excitement in one’s chest.',
    language: 'korean',
    status: 'learning',
    level: 'Beginner',
    tags: [{ label: 'emotion' }, { label: 'daily life' }],
    examples: [
      {
        id: 'ex-10',
        sentence: '새 책을 펼칠 때마다 마음이 설렌다.',
        reading: 'Sae chaek-eul pyeolchil ttae-mada ma-eum-i seol-len-da.',
        translation: 'Every time I open a new book, my heart flutters with excitement.',
      },
    ],
    etymology:
      'Native Korean expressive verb capturing the physical feeling of an unsteady, excited heartbeat.',
    source: 'Korean dialogue unit 3',
    conjugations: [
      { id: 'c-16', form: 'Present polite', value: '설레요 (seol-le-yo)' },
      { id: 'c-17', form: 'Past polite', value: '설렜어요 (seol-let-seo-yo)' },
      { id: 'c-18', form: 'Noun modifier', value: '설레는 (seol-le-neun)' },
    ],
    createdAt: '2026-10-05T09:00:00.000Z',
    updatedAt: '2026-10-14T11:00:00.000Z',
  },
  {
    id: 'vocab-8',
    word: '햇살',
    reading: '햇살',
    romanization: 'haetsal',
    meaning: 'Warm sunbeams, rays of gentle sunlight pouring through an open window.',
    language: 'korean',
    status: 'known',
    level: 'Beginner',
    tags: [{ label: 'nature' }],
    examples: [
      {
        id: 'ex-11',
        sentence: '창문 사이로 아침 햇살이 부드럽게 비쳤다.',
        reading: 'Chang-mun sai-ro a-chim haet-sal-i bu-deu-reop-ge bi-chyeot-da.',
        translation: 'Through the window, morning sunlight shone in gently.',
      },
    ],
    etymology: 'Compound of 해 (hae, sun) + 살 (sal, arrow/ray/shaft).',
    source: 'Poetry notebook',
    conjugations: [{ id: 'c-19', form: 'Noun', value: '햇살 (haetsal)' }],
    createdAt: '2026-10-02T13:00:00.000Z',
    updatedAt: '2026-10-12T14:00:00.000Z',
  },
  {
    id: 'vocab-9',
    word: 'Sobremesa',
    reading: 'so-bre-me-sa',
    romanization: 'sobremesa',
    meaning:
      'The lingering period after a meal spent sharing conversation, coffee, and stories around the dining table.',
    language: 'spanish',
    status: 'known',
    level: 'Intermediate',
    tags: [{ label: 'culture' }, { label: 'conversation' }],
    examples: [
      {
        id: 'ex-12',
        sentence: 'La sobremesa duró casi tres horas entre café y recuerdos.',
        reading: 'La sobremesa duró casi tres horas entre café y recuerdos.',
        translation: 'The table talk lasted nearly three hours over coffee and fond memories.',
      },
    ],
    etymology:
      'From sobre (over / upon) + mesa (table). A cultural cornerstone of Spanish and Latin American dining.',
    source: 'Madrid travel journal',
    conjugations: [{ id: 'c-20', form: 'Noun (f)', value: 'La sobremesa' }],
    createdAt: '2026-09-12T18:00:00.000Z',
    updatedAt: '2026-10-08T19:00:00.000Z',
  },
  {
    id: 'vocab-10',
    word: 'Madrugada',
    reading: 'ma-dru-ga-da',
    romanization: 'madrugada',
    meaning: 'The tranquil early hours of the morning between midnight and sunrise.',
    language: 'spanish',
    status: 'learning',
    level: 'Beginner',
    tags: [{ label: 'time' }, { label: 'daily life' }],
    examples: [
      {
        id: 'ex-13',
        sentence: 'En el silencio de la madrugada, las palabras se escuchan con más claridad.',
        reading: 'En el silencio de la madrugada, las palabras se escuchan con más claridad.',
        translation: 'In the stillness of the early morning, words are heard with greater clarity.',
      },
    ],
    etymology:
      'Derived from madrugar (to rise early), from Latin maturare (to ripen, act in good season).',
    source: 'Short story anthology',
    conjugations: [
      { id: 'c-21', form: 'Noun (f)', value: 'La madrugada' },
      { id: 'c-22', form: 'Verb base', value: 'Madrugar (to wake early)' },
    ],
    createdAt: '2026-09-15T11:00:00.000Z',
    updatedAt: '2026-10-11T12:00:00.000Z',
  },
  {
    id: 'vocab-11',
    word: 'Petrichor',
    reading: 'pet-ri-kor',
    romanization: 'petrichor',
    meaning:
      'The distinctive, pleasant earthy scent that accompanies the first rain after a long period of warm, dry weather.',
    language: 'english',
    status: 'known',
    level: 'Advanced',
    tags: [{ label: 'nature' }, { label: 'sensory' }],
    examples: [
      {
        id: 'ex-14',
        sentence:
          'The sudden October shower released the sharp, nostalgic scent of petrichor from the pavement.',
        reading:
          'The sudden October shower released the sharp, nostalgic scent of petrichor from the pavement.',
        translation:
          'Hujan tiba-tiba di bulan Oktober melepaskan aroma petrichor yang tajam dan bernostalgia dari aspal jalan.',
      },
    ],
    etymology:
      'Coined in 1964 from Greek petra (stone) and ichor (the ethereal fluid flowing in the veins of gods).',
    source: 'Essay on weather and memory',
    conjugations: [{ id: 'c-23', form: 'Noun (uncountable)', value: 'Petrichor' }],
    createdAt: '2026-09-01T15:00:00.000Z',
    updatedAt: '2026-09-28T16:00:00.000Z',
  },
  {
    id: 'vocab-12',
    word: 'Renjana',
    reading: 'ren-ja-na',
    romanization: 'renjana',
    meaning:
      'Rasa hati yang kuat; gairah atau kerinduan yang mendalam terhadap sesuatu hal atau karya.',
    language: 'indonesian',
    status: 'known',
    level: 'Intermediate',
    tags: [{ label: 'emotion' }, { label: 'literary' }],
    examples: [
      {
        id: 'ex-15',
        sentence: 'Ia menulis setiap catatan dengan renjana seorang pembelajar sejati.',
        reading: 'Ia menulis setiap catatan dengan renjana seorang pembelajar sejati.',
        translation: 'She wrote every note with the heartfelt passion of a true self-learner.',
      },
    ],
    etymology: 'Berasal dari bahasa Sanskerta rañjana (menyenangkan, memberi warna, memikat hati).',
    source: 'Catatan pinggir buku sastra',
    conjugations: [
      { id: 'c-24', form: 'Nomina', value: 'Renjana' },
      { id: 'c-25', form: 'Dengan preposisi', value: 'Dengan renjana' },
    ],
    createdAt: '2026-09-05T10:00:00.000Z',
    updatedAt: '2026-10-10T08:00:00.000Z',
  },
  {
    id: 'vocab-13',
    word: 'Semilir',
    reading: 'se-mi-lir',
    romanization: 'semilir',
    meaning:
      'Hembusan angin sepoi-sepoi yang lembut, sejuk, dan menenangkan di bawah naungan pohon.',
    language: 'indonesian',
    status: 'known',
    level: 'Beginner',
    tags: [{ label: 'nature' }, { label: 'weather' }],
    examples: [
      {
        id: 'ex-16',
        sentence: 'Semilir angin sore membalik lembar-lembar buku catatan di atas meja kayu.',
        reading: 'Semilir angin sore membalik lembar-lembar buku catatan di atas meja kayu.',
        translation:
          'The gentle afternoon breeze turned the pages of the notebook on the wooden table.',
      },
    ],
    etymology:
      'Kata serapan dari bahasa Jawa silir/semilir yang menggambarkan hawa sejuk angin perlahan.',
    source: 'Jurnal sore hari',
    conjugations: [{ id: 'c-26', form: 'Adjektiva / Nomina', value: 'Angin semilir' }],
    createdAt: '2026-09-08T16:00:00.000Z',
    updatedAt: '2026-10-12T17:00:00.000Z',
  },
]
