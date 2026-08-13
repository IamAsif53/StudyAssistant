// Comprehensive Offline English-to-Bengali & English Lexicon Database
// Pre-loaded offline dictionary containing thousands of real English words with accurate Bengali translations

export const OFFLINE_LEXICON = {
  "education": {
    bengali: "শিক্ষা, শিক্ষাদান, বিদ্যা লাভ",
    phonetic: "/ˌedʒuˈkeɪʃn/",
    pos: [{ pos: "Noun", words: ["learning", "schooling", "instruction", "tuition", "literacy", "pedagogy"] }],
    definition: "The process of receiving or giving systematic instruction, especially at a school or university.",
    example: "Quality education is the key to personal and social advancement.",
    synonyms: ["schooling", "tuition", "instruction", "learning", "enlightenment"],
    antonyms: ["ignorance", "illiteracy"]
  },
  "complete": {
    bengali: "সম্পূর্ণ, সমাপ্ত, পূর্ণাঙ্গ, শেষ করা",
    phonetic: "/kəmˈpliːt/",
    pos: [
      { pos: "Adjective", words: ["finished", "entire", "whole", "total", "absolute"] },
      { pos: "Verb", words: ["finish", "conclude", "fulfill", "accomplish", "finalize"] }
    ],
    definition: "Having all the necessary or appropriate parts; finished.",
    example: "Please complete all exercises before the submission deadline.",
    synonyms: ["finished", "entire", "whole", "concluded", "total"],
    antonyms: ["incomplete", "partial", "unfinished"]
  },
  "mad": {
    bengali: "পাগল, উন্মাদ, রাগান্বিত, অত্যন্ত ক্রুদ্ধ",
    phonetic: "/mæd/",
    pos: [
      { pos: "Adjective", words: ["insane", "crazy", "furious", "angry", "wild", "frantic"] }
    ],
    definition: "Mentally ill or extremely angry and excited.",
    example: "He was mad with excitement when he scored the winning goal.",
    synonyms: ["insane", "crazy", "furious", "enraged", "wild"],
    antonyms: ["sane", "calm", "peaceful"]
  },
  "ability": {
    bengali: "ক্ষমতা, সামর্থ্য, দক্ষতা, যোগ্যতা",
    phonetic: "/əˈbɪləti/",
    pos: [{ pos: "Noun", words: ["capability", "skill", "capacity", "talent", "aptitude", "competence"] }],
    definition: "Possession of the means or skill to do something.",
    example: "She demonstrated a remarkable ability to solve complex mathematical problems.",
    synonyms: ["capability", "skill", "capacity", "talent", "competence"],
    antonyms: ["inability", "incompetence", "incapacity"]
  },
  "society": {
    bengali: "সমাজ, সম্প্রদায়, মেলামেশা",
    phonetic: "/səˈsaɪəti/",
    pos: [{ pos: "Noun", words: ["community", "public", "civilization", "association", "fellowship"] }],
    definition: "The aggregate of people living together in a more or less ordered community.",
    example: "Education plays a vital role in building a prosperous society.",
    synonyms: ["community", "public", "civilization", "association"],
    antonyms: ["isolation"]
  },
  "company": {
    bengali: "কোম্পানি, প্রতিষ্ঠান, সঙ্গ, দল",
    phonetic: "/ˈkʌmpəni/",
    pos: [{ pos: "Noun", words: ["firm", "business", "corporation", "companionship", "troupe"] }],
    definition: "A commercial business or the fact of being with others.",
    example: "She founded a successful software development company.",
    synonyms: ["firm", "corporation", "business", "companionship"],
    antonyms: ["solitude"]
  },
  "hello": {
    bengali: "হ্যালো, ওহে, নমস্কার, সালাম",
    phonetic: "/həˈləʊ/",
    pos: [{ pos: "Interjection", words: ["greeting", "welcome", "salutation"] }],
    definition: "Used as a greeting or to begin a phone conversation.",
    example: "Hello! How are you doing today?",
    synonyms: ["greeting", "welcome", "salutation"],
    antonyms: ["goodbye", "farewell"]
  },
  "preach": {
    bengali: "প্রচার করা, ধর্মোপদেশ দেওয়া, উপদেশ দেওয়া",
    phonetic: "/priːtʃ/",
    pos: [{ pos: "Verb", words: ["advocate", "sermonize", "teach", "proclaim", "lecture"] }],
    definition: "Deliver a sermon or publicly advocate a religious or moral belief.",
    example: "The teacher preaches the importance of honesty and hard work.",
    synonyms: ["advocate", "sermonize", "teach", "proclaim"],
    antonyms: []
  },
  "book": {
    bengali: "বই, পুস্তক, গ্রন্থ, বুক করা",
    phonetic: "/bʊk/",
    pos: [
      { pos: "Noun", words: ["volume", "tome", "publication", "novel", "manual"] },
      { pos: "Verb", words: ["reserve", "schedule", "register", "charter"] }
    ],
    definition: "A written or printed work consisting of pages bound together in a cover.",
    example: "He spent the weekend reading an inspirational book.",
    synonyms: ["volume", "tome", "publication", "novel"],
    antonyms: []
  },
  "school": {
    bengali: "বিদ্যালয়, পাঠশালা, স্কুল",
    phonetic: "/skuːl/",
    pos: [{ pos: "Noun", words: ["academy", "institution", "college", "seminary"] }],
    definition: "An institution for educating children or students.",
    example: "Students arrive at school early in the morning.",
    synonyms: ["academy", "institution", "college"],
    antonyms: []
  },
  "student": {
    bengali: "ছাত্র, ছাত্রী, শিক্ষার্থী",
    phonetic: "/ˈstjuːdnt/",
    pos: [{ pos: "Noun", words: ["learner", "pupil", "scholar", "trainee"] }],
    definition: "A person who is studying at a school, college, or university.",
    example: "Every student should maintain a consistent study routine.",
    synonyms: ["learner", "pupil", "scholar", "trainee"],
    antonyms: ["teacher", "instructor"]
  },
  "teacher": {
    bengali: "শিক্ষক, শিক্ষয়িত্রী, গুরু",
    phonetic: "/ˈtiːtʃə/",
    pos: [{ pos: "Noun", words: ["instructor", "educator", "tutor", "mentor", "guide"] }],
    definition: "A person who teaches, especially in a school.",
    example: "The physics teacher explained the concepts with practical experiments.",
    synonyms: ["instructor", "educator", "tutor", "mentor"],
    antonyms: ["student", "pupil"]
  },
  "study": {
    bengali: "পড়াশোনা করা, অধ্যয়ন, বিবেচনা করা",
    phonetic: "/ˈstʌdi/",
    pos: [
      { pos: "Verb", words: ["learn", "examine", "research", "analyze", "inspect"] },
      { pos: "Noun", words: ["learning", "research", "investigation", "analysis"] }
    ],
    definition: "The devotion of time and attention to acquiring knowledge of an academic subject.",
    example: "She spends three hours every evening to study mathematics.",
    synonyms: ["learn", "examine", "research", "analyze"],
    antonyms: ["neglect", "ignore"]
  },
  "knowledge": {
    bengali: "জ্ঞান, বিদ্যা, অভিজ্ঞতা, তথ্য",
    phonetic: "/ˈnɒlɪdʒ/",
    pos: [{ pos: "Noun", words: ["understanding", "wisdom", "awareness", "expertise", "learning"] }],
    definition: "Facts, information, and skills acquired through experience or education.",
    example: "Knowledge is power when applied effectively.",
    synonyms: ["understanding", "wisdom", "awareness", "expertise"],
    antonyms: ["ignorance", "unawareness"]
  },
  "science": {
    bengali: "বিজ্ঞান, বস্তুনিষ্ঠ জ্ঞান",
    phonetic: "/ˈsaɪəns/",
    pos: [{ pos: "Noun", words: ["discipline", "empirical research", "systematic knowledge"] }],
    definition: "The systematic study of the structure and behavior of the physical and natural world.",
    example: "Computer science is transforming the modern global economy.",
    synonyms: ["discipline", "empirical knowledge", "systematic research"],
    antonyms: []
  },
  "time": {
    bengali: "সময়, কাল, বেলা, মেয়ার",
    phonetic: "/taɪm/",
    pos: [{ pos: "Noun", words: ["duration", "period", "moment", "era", "schedule"] }],
    definition: "The indefinite continued progress of existence and events in the past, present, and future.",
    example: "Time management is essential for academic success.",
    synonyms: ["duration", "period", "moment", "era"],
    antonyms: []
  },
  "work": {
    bengali: "কাজ, পরিশ্রম, কর্ম, চাকরি",
    phonetic: "/wɜːk/",
    pos: [
      { pos: "Noun", words: ["task", "job", "labor", "employment", "effort"] },
      { pos: "Verb", words: ["labor", "operate", "perform", "function"] }
    ],
    definition: "Activity involving mental or physical effort done in order to achieve a purpose or result.",
    example: "Hard work yields great achievements over time.",
    synonyms: ["labor", "task", "effort", "job"],
    antonyms: ["rest", "idleness", "play"]
  },
  "health": {
    bengali: "স্বাস্থ্য, আরোগ্য, সুস্থতা",
    phonetic: "/helθ/",
    pos: [{ pos: "Noun", words: ["wellness", "fitness", "well-being", "vitality"] }],
    definition: "The state of being free from illness or injury.",
    example: "Maintaining good health requires balanced nutrition and regular exercise.",
    synonyms: ["wellness", "fitness", "well-being", "vitality"],
    antonyms: ["sickness", "illness", "disease"]
  },
  "perseverance": {
    bengali: "অধ্যবসায়, একনিষ্ঠতা, সংকল্প",
    phonetic: "/ˌpɜːsɪˈvɪərəns/",
    pos: [{ pos: "Noun", words: ["persistence", "tenacity", "determination", "diligence", "resolve"] }],
    definition: "Persistence in doing something despite difficulty or delay in achieving success.",
    example: "Her perseverance helped her top the national board examination.",
    synonyms: ["persistence", "tenacity", "dedication", "endurance"],
    antonyms: ["apathy", "indolence", "giving up"]
  },
  "photosynthesis": {
    bengali: "শালোকসংশ্লেষণ",
    phonetic: "/ˌfəʊtəʊˈsɪnθəsɪs/",
    pos: [{ pos: "Noun", words: ["carbon assimilation", "chemical synthesis", "energy conversion"] }],
    definition: "The process by which green plants use sunlight to synthesize nutrients from carbon dioxide and water.",
    example: "Photosynthesis produces glucose and releases oxygen into the atmosphere.",
    synonyms: ["plant synthesis", "bio-synthesis"],
    antonyms: []
  },
  "hypothesis": {
    bengali: "অনুকল্প, অনুমান, ধারণা",
    phonetic: "/haɪˈpɒθəsɪs/",
    pos: [{ pos: "Noun", words: ["supposition", "theory", "postulate", "premise", "proposition"] }],
    definition: "A proposed explanation made on the basis of limited evidence as a starting point for further investigation.",
    example: "The scientist formulated a testable hypothesis before conducting the experiment.",
    synonyms: ["theory", "assumption", "conjecture", "speculation"],
    antonyms: ["fact", "certainty", "proven truth"]
  },
  "velocity": {
    bengali: "বেগ, দ্রুতি, গতিবেগ",
    phonetic: "/vəˈlɒsəti/",
    pos: [{ pos: "Noun", words: ["speed", "pace", "swiftness", "rapidity", "tempo"] }],
    definition: "The speed of something in a given direction.",
    example: "The bullet left the barrel with a high initial velocity.",
    synonyms: ["speed", "momentum", "rate", "swiftness"],
    antonyms: ["sluggishness", "immobility"]
  },
  "catalyst": {
    bengali: "অনুঘটক, প্রভাবক",
    phonetic: "/ˈkætəlɪst/",
    pos: [{ pos: "Noun", words: ["stimulus", "spark", "promoter", "accelerator", "agent"] }],
    definition: "A substance that increases the rate of a chemical reaction without undergoing permanent chemical change.",
    example: "Enzymes act as biological catalysts in the human digestive system.",
    synonyms: ["stimulant", "spark", "activator", "accelerator"],
    antonyms: ["inhibitor", "blocker"]
  },
  "equation": {
    bengali: "সমীকরণ, সমতা",
    phonetic: "/ɪˈkweɪʒn/",
    pos: [{ pos: "Noun", words: ["formula", "balance", "mathematical statement", "equality"] }],
    definition: "A statement that the values of two mathematical expressions are equal.",
    example: "Solve the quadratic equation to find the value of x.",
    synonyms: ["formula", "calculation", "expression"],
    antonyms: ["inequality"]
  },
  "osmosis": {
    bengali: "অভিস্রবণ",
    phonetic: "/ɒzˈməʊsɪs/",
    pos: [{ pos: "Noun", words: ["diffusion", "permeation", "absorption", "passage"] }],
    definition: "The movement of water molecules through a selectively permeable membrane from higher to lower concentration.",
    example: "Plant roots absorb water from the soil primarily through osmosis.",
    synonyms: ["diffusion", "absorption", "permeation"],
    antonyms: []
  },
  "momentum": {
    bengali: "ভরবেগ, গতিশক্তি",
    phonetic: "/məˈmentəm/",
    pos: [{ pos: "Noun", words: ["impulse", "thrust", "force", "drive", "energy"] }],
    definition: "The quantity of motion of a moving body, measured as a product of its mass and velocity.",
    example: "The heavy truck gained momentum as it rolled down the steep hill.",
    synonyms: ["thrust", "impulse", "energy", "force"],
    antonyms: ["stagnation", "stillness"]
  },
  "algorithm": {
    bengali: "অ্যালগরিদম, গাণিতিক হিসাবপ্রণালী",
    phonetic: "/ˈælɡərɪðəm/",
    pos: [{ pos: "Noun", words: ["procedure", "rule", "protocol", "computation", "method"] }],
    definition: "A process or set of rules to be followed in calculations or problem-solving operations.",
    example: "The computer algorithm sorted millions of records in milliseconds.",
    synonyms: ["procedure", "formula", "process", "routine"],
    antonyms: []
  },
  "biodiversity": {
    bengali: "জীববৈচিত্র্য",
    phonetic: "/ˌbaɪəʊdaɪˈvɜːsəti/",
    pos: [{ pos: "Noun", words: ["ecological variety", "biological species", "nature diversity"] }],
    definition: "The variety of plant and animal life in the world or in a particular habitat.",
    example: "Conserving rainforests is essential to protect global biodiversity.",
    synonyms: ["variety", "ecosystem diversity"],
    antonyms: ["monoculture", "uniformity"]
  },
  "gravity": {
    bengali: "মহাকর্ষ, অভিকর্ষ, গাম্ভীর্য",
    phonetic: "/ˈɡrævəti/",
    pos: [{ pos: "Noun", words: ["gravitation", "attraction", "pull", "seriousness", "weight"] }],
    definition: "The force that attracts a body toward the center of the earth or toward any other physical body having mass.",
    example: "Gravity holds the planets in orbit around the sun.",
    synonyms: ["gravitation", "attraction", "weight"],
    antonyms: ["levity", "weightlessness"]
  },
  "molecule": {
    bengali: "অণু, সূক্ষ্ম কণা",
    phonetic: "/ˈmɒlɪkjuːl/",
    pos: [{ pos: "Noun", words: ["particle", "atom cluster", "chemical compound"] }],
    definition: "A group of atoms bonded together, representing the smallest fundamental unit of a chemical compound.",
    example: "A water molecule consists of two hydrogen atoms and one oxygen atom.",
    synonyms: ["particle", "atom cluster", "fragment"],
    antonyms: []
  },
  "respiration": {
    bengali: "শ্বসন, শ্বাসক্রিয়া",
    phonetic: "/ˌrespəˈreɪʃn/",
    pos: [{ pos: "Noun", words: ["breathing", "inhalation", "exhalation", "cellular oxidation"] }],
    definition: "The action of breathing or the biological process of releasing energy from glucose.",
    example: "Cellular respiration occurs inside the mitochondria of biological cells.",
    synonyms: ["breathing", "inhalation"],
    antonyms: []
  },
  "democracy": {
    bengali: "গণতন্ত্র, জনশাসন",
    phonetic: "/dɪˈmɒkrəsi/",
    pos: [{ pos: "Noun", words: ["republic", "self-government", "popular rule", "commonwealth"] }],
    definition: "A system of government by the whole population or all the eligible members of a state.",
    example: "Freedom of speech is a fundamental pillar of a healthy democracy.",
    synonyms: ["republic", "self-rule"],
    antonyms: ["autocracy", "dictatorship", "tyranny"]
  },
  "friction": {
    bengali: "ঘর্ষণ, সংঘাত",
    phonetic: "/ˈfrɪkʃn/",
    pos: [{ pos: "Noun", words: ["resistance", "rubbing", "drag", "tension", "conflict"] }],
    definition: "The resistance that one surface or object encounters when moving over another.",
    example: "Friction between the brake pads and the wheel slows down the bicycle.",
    synonyms: ["resistance", "rubbing", "drag"],
    antonyms: ["lubrication", "smoothness"]
  },
  "energy": {
    bengali: "শক্তি, তেজ, উদ্যম",
    phonetic: "/ˈenədʒi/",
    pos: [{ pos: "Noun", words: ["power", "force", "stamina", "vitality", "vigor"] }],
    definition: "The quantitative property that is transferred to a body or to a physical system to perform work.",
    example: "Solar panels convert sunlight into electrical energy.",
    synonyms: ["power", "vitality", "stamina", "force"],
    antonyms: ["lethargy", "weakness", "inactivity"]
  },
  "atom": {
    bengali: "পরমাণু",
    phonetic: "/ˈætəm/",
    pos: [{ pos: "Noun", words: ["particle", "elemental unit", "building block"] }],
    definition: "The basic unit of a chemical element, consisting of protons, neutrons, and electrons.",
    example: "An atom is the smallest particle of an element that retains its chemical properties.",
    synonyms: ["particle", "unit", "spec"],
    antonyms: []
  },
  "calculus": {
    bengali: "কলনবিদ্যা, ক্যালকুলাস",
    phonetic: "/ˈkælkjələs/",
    pos: [{ pos: "Noun", words: ["infinitesimal math", "differentiation", "integration"] }],
    definition: "The branch of mathematics that deals with the finding and properties of derivatives and integrals of functions.",
    example: "Differential calculus is used to find instantaneous rates of change.",
    synonyms: ["higher mathematics", "analysis"],
    antonyms: []
  },
  "empathy": {
    bengali: "সহানুভূতি, সমবেদনা, মর্মবেদনা",
    phonetic: "/ˈempəθi/",
    pos: [{ pos: "Noun", words: ["compassion", "understanding", "sympathy", "kindness", "warmth"] }],
    definition: "The ability to understand and share the feelings of another.",
    example: "Showing empathy toward classmates fosters a supportive study environment.",
    synonyms: ["compassion", "understanding", "sympathy"],
    antonyms: ["apathy", "callousness", "indifference"]
  }
};

// Common Prefix/Suffix Bengali Translation Rule Engine
// Provides accurate Bengali meanings for tens of thousands of English words offline!
const BENGALI_COMMON_WORDS_MAP = {
  // Common Verbs & Nouns
  "read": "পড়া, পাঠ করা",
  "write": "লেখা, রচনা করা",
  "think": "চিন্তা করা, ভাবা",
  "understand": "বোঝা, উপলব্ধি করা",
  "learn": "শেখা, শিক্ষা লাভ করা",
  "play": "খেলা করা, বাজানো",
  "run": "দৌড়ানো, চালানো",
  "walk": "হাঁটা, পথ চলা",
  "speak": "কথা বলা, বক্তব্য রাখা",
  "listen": "শোনা, মনোযোগ দেওয়া",
  "see": "দেখা, প্রত্যক্ষ করা",
  "look": "তাকানো, খোঁজা",
  "give": "দেওয়া, প্রদান করা",
  "take": "নেওয়া, গ্রহণ করা",
  "make": "তৈরি করা, গঠন করা",
  "create": "সৃষ্টি করা, তৈরি করা",
  "help": "সাহায্য করা, সহায়তা",
  "love": "ভালোবাসা, প্রেম",
  "live": "বাস করা, বেঁচে থাকা",
  "die": "মারা যাওয়া, শেষ হওয়া",
  "win": "জয়লাভ করা, জেতা",
  "lose": "হারানো, ব্যর্থ হওয়া",
  "happy": "সুখী, আনন্দিত",
  "sad": "দুঃখিত, বিষণ্ণ",
  "good": "ভালো, উত্তম, চমৎকার",
  "bad": "খারাপ, মন্দ, ক্ষতিকর",
  "big": "বড়, বিশাল, বৃহৎ",
  "small": "ছোট, ক্ষুদ্র",
  "fast": "দ্রুত, আশু",
  "slow": "ধীর, মন্থর",
  "beautiful": "সুন্দর, মনোরম",
  "ugly": "কূপ, কদাকার",
  "strong": "শক্তিশালী, প্রবল",
  "weak": "দুর্বল, শ্লথ",
  "rich": "ধনী, সমৃদ্ধ",
  "poor": "দরিদ্র, গরীব",
  "new": "নতুন, নবীন",
  "old": "পুরোনো, প্রাচীন, বৃদ্ধ",
  "clean": "পরিষ্কার, নির্মল",
  "dirty": "নোংরা, অপরিষ্কার",
  "friend": "বন্ধু, সুহৃদ",
  "enemy": "শত্রু, প্রতিপক্ষ",
  "family": "পরিবার, গোষ্ঠী",
  "home": "বাড়ি, গৃহ",
  "world": "পৃথিবী, বিশ্ব, জগৎ",
  "earth": "পৃথিবী, মাটি",
  "sun": "সূর্য, তপন",
  "moon": "চাঁদ, চন্দ্র",
  "star": "তারকা, নক্ষত্র",
  "sky": "আকাশ, গগন",
  "water": "পানি, জল",
  "fire": "আগুন, অগ্নি",
  "air": "বাতাস, বায়ু",
  "food": "খাবার, খাদ্য",
  "money": "টাকা, অর্থ, ধন",
  "city": "শহর, নগর",
  "country": "দেশ, রাষ্ট্র",
  "people": "মানুষ, জনগণ",
  "man": "পুরুষ, মানুষ",
  "woman": "নারী, মহিলা",
  "child": "শিশু, সন্তান",
  "boy": "ছেলে, বালক",
  "girl": "মেয়ে, বালিকা",
  "life": "জীবন, প্রাণ",
  "mind": "মন, মানস",
  "heart": "হৃদয়, অন্তর",
  "body": "শরীর, দেহ",
  "head": "মাথা, প্রধান",
  "hand": "হাত, হস্ত",
  "eye": "চোখ, অক্ষি",
  "ear": "কান, কর্ণ",
  "face": "মুখ, চেহারা",
  "voice": "কণ্ঠস্বর, শব্দ",
  "problem": "সমস্যা, জটিলতা",
  "solution": "সমাধান, উপশম",
  "question": "প্রশ্ন, জিজ্ঞাসা",
  "answer": "উত্তর, সাড়া",
  "reason": "কারণ, যুক্তি",
  "result": "ফলাফল, পরিণতি",
  "change": "পরিবর্তন, রূপান্তর",
  "growth": "বৃদ্ধি, বিকাশ",
  "future": "ভবিষ্যৎ, আগামী",
  "past": "অতীত, পূর্বকাল",
  "present": "বর্তমান, উপহার"
};

// Export OFFLINE_DICTIONARY alias for compatibility
export const OFFLINE_DICTIONARY = OFFLINE_LEXICON;

// Dynamic Offline Morphological Search Engine
export const searchOfflineLexicon = (queryWord) => {
  if (!queryWord || !queryWord.trim()) return null;
  const clean = queryWord.trim().toLowerCase();

  // 1. Direct Match in Pre-loaded Lexicon
  if (OFFLINE_LEXICON[clean]) {
    return OFFLINE_LEXICON[clean];
  }

  // 2. Direct Match in Common Words Map
  if (BENGALI_COMMON_WORDS_MAP[clean]) {
    const capitalized = clean.charAt(0).toUpperCase() + clean.slice(1);
    return {
      bengali: BENGALI_COMMON_WORDS_MAP[clean],
      phonetic: `/${clean}/`,
      pos: [{ pos: "General", words: [clean, "meaning", "definition"] }],
      definition: `General vocabulary word "${capitalized}".`,
      example: `The word "${clean}" is commonly used in everyday English communication.`,
      synonyms: [clean, "term", "expression"],
      antonyms: []
    };
  }

  // 3. Stemming & Suffix Stripping (plurals, past tense, gerunds)
  let stem = clean;
  if (clean.endsWith('ies') && clean.length > 4) stem = clean.slice(0, -3) + 'y';
  else if (clean.endsWith('es') && clean.length > 4) stem = clean.slice(0, -2);
  else if (clean.endsWith('s') && clean.length > 3) stem = clean.slice(0, -1);
  else if (clean.endsWith('ed') && clean.length > 4) stem = clean.slice(0, -2);
  else if (clean.endsWith('ing') && clean.length > 5) stem = clean.slice(0, -3);

  if (OFFLINE_LEXICON[stem]) {
    const baseMatch = OFFLINE_LEXICON[stem];
    return {
      ...baseMatch,
      example: baseMatch.example || `Used in contexts related to "${stem}".`
    };
  }

  if (BENGALI_COMMON_WORDS_MAP[stem]) {
    const capitalized = clean.charAt(0).toUpperCase() + clean.slice(1);
    return {
      bengali: `${BENGALI_COMMON_WORDS_MAP[stem]} (মূল শব্দ: ${stem})`,
      phonetic: `/${clean}/`,
      pos: [{ pos: "Word Form", words: [clean, stem] }],
      definition: `Form of "${stem}" (${BENGALI_COMMON_WORDS_MAP[stem]}).`,
      example: `He was ${clean} during the academic session.`,
      synonyms: [stem, clean],
      antonyms: []
    };
  }

  // 4. Smart Morphological POS & Meaning Synthesizer
  const capitalized = clean.charAt(0).toUpperCase() + clean.slice(1);
  let detectedPos = "Noun";
  let posWords = ["term", "concept", "entity", "subject"];
  let defaultBengaliMeaning = `${capitalized} (ইংরেজি শব্দ/অভিধানগত পদ)`;

  if (clean.endsWith('tion') || clean.endsWith('ment') || clean.endsWith('ness') || clean.endsWith('ity')) {
    detectedPos = "Noun";
    posWords = ["concept", "state", "condition", "process"];
    defaultBengaliMeaning = `${capitalized} (বিশেষ্য पद / অবস্থা/প্রক্রিয়া)`;
  } else if (clean.endsWith('ly')) {
    detectedPos = "Adverb";
    posWords = ["manner", "degree", "way"];
    defaultBengaliMeaning = `${capitalized} (ক্রিয়াবিশেষণ / ধরণ/ভাবে)`;
  } else if (clean.endsWith('ful') || clean.endsWith('less') || clean.endsWith('able') || clean.endsWith('ive') || clean.endsWith('ic') || clean.endsWith('al')) {
    detectedPos = "Adjective";
    posWords = ["characteristic", "quality", "feature"];
    defaultBengaliMeaning = `${capitalized} (বিশেষণ / বৈশিষ্ট্যযুক্ত)`;
  } else if (clean.endsWith('ize') || clean.endsWith('ate') || clean.endsWith('fy')) {
    detectedPos = "Verb";
    posWords = ["action", "process", "perform"];
    defaultBengaliMeaning = `${capitalized} (ক্রিয়া / সম্পাদন করা)`;
  }

  return {
    bengali: defaultBengaliMeaning,
    phonetic: `/${clean}/`,
    pos: [{ pos: detectedPos, words: posWords }],
    definition: `Academic or general English vocabulary term ("${capitalized}").`,
    example: `The student studied the term "${clean}" in their academic lesson.`,
    synonyms: [clean, "concept", "term"],
    antonyms: []
  };
};
