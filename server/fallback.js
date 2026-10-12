// Local, keyword-based responder used when GEMINI_API_KEY is missing / quota is
// exhausted. It has to carry the "Ask me anything" box on its own, so it needs
// dense keyword coverage in EN and IT and answers that don't feel canned.

const FACTS_EN = {
  who: [
    "Alberto Vergani is a developer and Social Media creator — a first-year Computer Engineering student at SUPSI in Lugano, Switzerland. He builds full-stack products with AI and engineers short-form video that performs on Instagram and TikTok.",
    "Alberto is a full-stack developer who builds with AI, based between Italy and Switzerland. He ships web apps end-to-end and runs short-form video for the same brands.",
  ],
  projects:
    "Three featured projects on the site: Kcal Tracker — a PWA food app that suggests what to eat from what's in your fridge (FastAPI, PostgreSQL, React, TypeScript, Gemini); and Baumarine — a website for an Italian luxury yacht shipyard on Lake Iseo, where Alberto did design, art direction and copy (WordPress); and Agriturismo Rosalber — a Next.js site for a farm stay in the woods near Varese, with wild game cooking, archery, events and rooms.",
  kcal:
    "Kcal Tracker flips calorie tracking around: instead of asking what you ate, it tells you what to eat. You list what's in the fridge, tap \"I'm hungry\" and get three meals for that time of day (meat first, since it spoils fastest); picking one logs it. In the evening it plans tomorrow's packed lunch and snacks. Photo and barcode logging, quests and quiet hours for notifications. Installs as a PWA and works offline. Stack: FastAPI + PostgreSQL + React + TypeScript + Gemini.",
  baumarine:
    "Baumarine is a site for a premium yacht builder on Lake Iseo. The brief was quiet and editorial. Alberto handled design, art direction and copy. Built on WordPress. Live at baumarine.it.",
  rosalber:
    "Agriturismo Rosalber is a personal project: the website for a farm stay in Castello Cabiaglio (Varese) — wild game cooking, archery ranges, events by the pond and rooms to stay over. It opens on drone footage and splits the place into four doors: table, adventure, events, rooms. Built with Next.js, React, TypeScript, Tailwind and Motion, hosted on Netlify. Live at agriturismorosalber.com.",
  skills:
    "Alberto works across Python, JavaScript, TypeScript, C/C++, HTML/CSS and Bash; React, Next.js, Node, Flask, FastAPI, Bootstrap, Tailwind, NumPy and pandas; MySQL, PostgreSQL, MongoDB, Redis; plus Docker, Git, Linux, VS Code, Cursor, Figma, Postman and Hugging Face.",
  process:
    "Alberto works in four steps — Scope (pin down what winning looks like and what's out of scope), Build (full-stack with AI where it earns its place), Ship (live on real infra like Docker with monitoring), Grow (short-form content built for how Instagram and TikTok actually rank things).",
  contact:
    "The fastest way is the Book a Call button at the top of the page — it opens a scheduling panel and confirms a Google Meet on your calendar. Or email albertovergani267@gmail.com. GitHub: github.com/clackes · LinkedIn: in/alberto-vergani.",
  book:
    "Click the Book a Call button in the top-right of the navbar. It opens a slide-up panel where you can pick a 30-minute slot; you'll get a Google Calendar invite with a Meet link.",
  location:
    "Alberto is based in Lugano, Switzerland (46.0037° N, 8.9511° E), and works across Italy, Switzerland and remote. Open to freelance and full-time roles.",
  ai:
    "Alberto builds with AI hands-on: Gemini and other models wired into real products (like the photo-to-calories feature in Kcal Tracker), prompt engineering, and agents placed where they genuinely help — not just called by name.",
  social:
    "Alberto engineers short-form video for how Instagram and TikTok actually rank content today: strategy first, AI-produced video where it saves time, and iteration on whatever spreads.",
  hire:
    "Yes — Alberto is open to freelance projects and full-time roles. Book a call from the navbar, or email albertovergani267@gmail.com with a couple of sentences about the project or role.",
  price:
    "Pricing depends on scope. The quickest path is a 30-min intro call from the Book a Call button in the navbar — Alberto scopes what's needed and sends a proposal within a day.",
  timeline:
    "Timelines depend on scope. A landing page or client site is typically 1–3 weeks; a full-stack product with AI takes longer. Book a call and Alberto will give you a realistic window.",
  stack:
    "Preferred stacks: React + TypeScript + Tailwind on the frontend, FastAPI or Node on the backend, PostgreSQL as the default database, Docker for shipping. AI via Gemini and OpenAI-compatible APIs when they earn their place.",
  age:
    "Alberto is a Computer Engineering student — his LinkedIn has the exact CV. The Book a Call button is the fastest way to get a direct answer.",
  guestbook:
    "There's a public Guestbook on the site — you can sign in and leave a message. Look for the Guestbook card in the \"More to Explore\" section.",
  languages:
    "Alberto speaks Italian and English fluently and can work in both.",
  fallback:
    "You can ask about Alberto's projects (Kcal Tracker, Baumarine, Agriturismo Rosalber), his skills and stack, how he works, or how to book a call. What would you like to know?",
};

const FACTS_IT = {
  who: [
    "Alberto Vergani è sviluppatore e Social Media creator — studente al primo anno di Ingegneria Informatica alla SUPSI di Lugano. Costruisce prodotti full-stack con l'AI e produce short-form video che performano su Instagram e TikTok.",
    "Alberto è uno sviluppatore full-stack che costruisce con l'AI e vive tra Italia e Svizzera. Realizza web app end-to-end e cura anche i social delle stesse aziende.",
  ],
  projects:
    "Tre progetti in evidenza sul sito: Kcal Tracker — una PWA che ti propone cosa mangiare con quello che hai in casa (FastAPI, PostgreSQL, React, TypeScript, Gemini); e Baumarine — sito per un cantiere di yacht di lusso sul Lago d'Iseo, dove Alberto ha fatto design, direzione artistica e copy (WordPress); e Agriturismo Rosalber — sito Next.js per un agriturismo nei boschi sopra Varese, con cucina di selvaggina, tiro con l'arco, eventi e alloggi.",
  kcal:
    "Kcal Tracker ribalta il conteggio delle calorie: invece di chiederti cosa hai mangiato, ti dice cosa mangiare. Scrivi cosa hai in casa, tocchi \"Ho fame\" e ricevi tre pasti per quell'ora (prima la carne, che scade prima); sceglierne uno lo registra. La sera prepara pranzo e merende del giorno dopo. Registrazione da foto e codice a barre, quest e fasce di silenzio per le notifiche. Si installa come PWA e funziona offline. Stack: FastAPI + PostgreSQL + React + TypeScript + Gemini.",
  baumarine:
    "Baumarine è il sito di un costruttore di yacht di lusso sul Lago d'Iseo. Il brief era sobrio ed editoriale. Alberto ha curato design, direzione artistica e copy. Costruito su WordPress. Live su baumarine.it.",
  rosalber:
    "Agriturismo Rosalber è un progetto personale: il sito di un agriturismo a Castello Cabiaglio (Varese) — cucina di selvaggina, campi di tiro con l'arco, eventi in riva al laghetto e camere per dormire. Si apre con riprese col drone e divide il posto in quattro porte: tavola, avventura, eventi, alloggi. Fatto con Next.js, React, TypeScript, Tailwind e Motion, hostato su Netlify. Live su agriturismorosalber.com.",
  skills:
    "Alberto lavora con Python, JavaScript, TypeScript, C/C++, HTML/CSS e Bash; React, Next.js, Node, Flask, FastAPI, Bootstrap, Tailwind, NumPy e pandas; MySQL, PostgreSQL, MongoDB, Redis; oltre a Docker, Git, Linux, VS Code, Cursor, Figma, Postman e Hugging Face.",
  process:
    "Alberto lavora in quattro passi — Scope (definire cosa significa vincere e cosa è fuori scope), Build (full-stack con AI dove serve davvero), Ship (in produzione su infrastruttura reale con Docker e monitoring), Grow (contenuti short-form pensati per come Instagram e TikTok li rankano oggi).",
  contact:
    "Il modo più veloce è il bottone \"Prenota una call\" in alto — apre un pannello per scegliere lo slot e conferma un Google Meet in calendario. Oppure scrivi a albertovergani267@gmail.com. GitHub: github.com/clackes · LinkedIn: in/alberto-vergani.",
  book:
    "Clicca il bottone \"Prenota una call\" in alto a destra della navbar. Apre un pannello dove scegli uno slot da 30 minuti; ti arriverà un invito Google Calendar con il link Meet.",
  location:
    "Alberto vive a Lugano, in Svizzera (46.0037° N, 8.9511° E), e lavora tra Italia, Svizzera e remoto. Aperto a freelance e ruoli full-time.",
  ai:
    "Alberto usa l'AI in modo pratico: Gemini e altri modelli integrati in prodotti reali (come il riconoscimento pasti in Kcal Tracker), prompt engineering, e agenti messi solo dove aggiungono valore — non solo citati per moda.",
  social:
    "Alberto produce short-form video pensati per come Instagram e TikTok rankano davvero oggi: prima la strategia, poi video prodotti con l'AI dove fa risparmiare tempo, e iterazione su ciò che gira.",
  hire:
    "Sì — Alberto è aperto sia a freelance sia a ruoli full-time. Prenota una call dalla navbar, o scrivi a albertovergani267@gmail.com con due righe sul progetto o sul ruolo.",
  price:
    "Il prezzo dipende dallo scope. La via più veloce è una call introduttiva di 30 minuti dal bottone \"Prenota una call\" — Alberto valuta cosa serve e manda una proposta entro un giorno.",
  timeline:
    "I tempi dipendono dallo scope. Una landing o un sito cliente sta di solito in 1–3 settimane; un prodotto full-stack con AI richiede di più. Prenota una call e Alberto ti dà una finestra realistica.",
  stack:
    "Stack preferiti: React + TypeScript + Tailwind sul frontend, FastAPI o Node sul backend, PostgreSQL come database di default, Docker per il deploy. AI via Gemini e API OpenAI-compatibili quando servono davvero.",
  age:
    "Alberto è studente di Ingegneria Informatica — il suo LinkedIn ha il CV completo. Prenotare una call dalla navbar è il modo più veloce per una risposta diretta.",
  guestbook:
    "Sul sito c'è un Guestbook pubblico — puoi accedere e lasciare un messaggio. Trovi la card \"Guestbook\" nella sezione \"Altro da esplorare\".",
  languages:
    "Alberto parla italiano e inglese fluentemente e lavora in entrambe le lingue.",
  fallback:
    "Puoi chiedermi dei progetti di Alberto (Kcal Tracker, Baumarine, Agriturismo Rosalber), delle sue skill e del suo stack, di come lavora, o di come prenotare una call. Cosa vuoi sapere?",
};

// Keyword rules — evaluated in order, first match wins. Keys are matched
// case-insensitively as substrings on the last user message.
const RULES = [
  { keys: ['book a call', 'book call', 'schedule', 'appointment', 'meet', 'meeting', 'prenot', 'prenotare', 'appuntamento', 'incontro', 'chiamata', 'call'], k: 'book' },
  { keys: ['hire', 'available', 'freelance', 'available for work', 'assumere', 'assumi', 'disponibile', 'lavor', 'ingaggia'], k: 'hire' },
  { keys: ['price', 'cost', 'quote', 'budget', 'rate', 'how much', 'prezzo', 'costo', 'costa', 'preventivo', 'quanto'], k: 'price' },
  { keys: ['timeline', 'how long', 'when', 'delivery', 'deadline', 'tempi', 'quanto tempo', 'consegna'], k: 'timeline' },
  { keys: ['stack', 'framework', 'library', 'tecnolog', 'framework preferito', 'stack preferito'], k: 'stack' },
  { keys: ['kcal', 'calorie', 'calorie', 'food', 'meal', 'barcode', 'macro', 'pasto', 'cibo'], k: 'kcal' },
  { keys: ['baumarine', 'yacht', 'boat', 'client', 'wordpress', 'cliente', 'barca', 'iseo'], k: 'baumarine' },
  { keys: ['rosalber', 'agriturismo', 'farm', 'archery', 'arco', 'selvaggina', 'varese', 'cabiaglio', 'next.js', 'nextjs'], k: 'rosalber' },
  { keys: ['project', 'projects', 'work', 'built', 'build', 'portfolio', 'progetti', 'lavori', 'lavoro'], k: 'projects' },
  { keys: ['skill', 'stack', 'tech', 'language', 'framework', 'tool', 'competen', 'linguaggi', 'linguaggio', 'tecnologi', 'strumenti', 'strumento'], k: 'skills' },
  { keys: ['process', 'how do you work', 'how does he work', 'approach', 'steps', 'processo', 'come lavor', 'come funziona', 'metodo'], k: 'process' },
  { keys: ['contact', 'email', 'reach', 'get in touch', 'linkedin', 'github', 'contatti', 'contattare', 'scrivere', 'raggiun'], k: 'contact' },
  { keys: ['where', 'location', 'based', 'lugano', 'ticino', 'switzerland', 'italy', 'live', 'dove', 'sede', 'vive', 'residenz', 'italia', 'svizzera'], k: 'location' },
  { keys: ['ai', 'gemini', 'agent', 'prompt', 'model', 'llm', 'machine learning', 'intelligenza', 'agente'], k: 'ai' },
  { keys: ['tiktok', 'instagram', 'social', 'reel', 'video', 'short-form', 'content', 'contenut'], k: 'social' },
  { keys: ['language', 'speak', 'english', 'italian', 'italiano', 'inglese', 'lingua', 'lingue'], k: 'languages' },
  { keys: ['guestbook', 'message board', 'sign', 'muro', 'messaggi'], k: 'guestbook' },
  { keys: ['old', 'age', 'anni', 'quanti anni'], k: 'age' },
  { keys: ['who', 'about', 'yourself', 'you do', 'he do', 'introduce', 'chi', 'presentati', 'presenta', 'raccont', 'parlami'], k: 'who' },
];

const IT_HINTS = [
  ' il ', ' la ', ' lo ', ' gli ', ' le ', ' un ', ' una ',
  'chi ', 'cosa ', 'come ', 'dove ', 'quando ', 'perch',
  'posso ', 'puoi ', 'vorrei ', 'voglio ', 'sono ', 'sei ',
  'ciao', 'grazie', 'per favore', 'prego', 'salve',
  'prenot', 'contatt', 'progett', 'lavor', 'compet', 'appuntament',
  'quanto ', 'quale ', 'quali ', 'anni',
];

function detectLang(msg, hint) {
  if (hint === 'it' || hint === 'en') return hint;
  const t = ' ' + (msg || '').toLowerCase() + ' ';
  return IT_HINTS.some((h) => t.includes(h)) ? 'it' : 'en';
}

function pick(v) {
  if (Array.isArray(v)) {
    const i = Math.floor(Math.random() * v.length);
    return v[i];
  }
  return v;
}

export function localAnswer(messages, langHint) {
  const last = String(messages[messages.length - 1]?.content ?? '');
  const lang = detectLang(last, langHint);
  const dict = lang === 'it' ? FACTS_IT : FACTS_EN;
  const low = last.toLowerCase();

  for (const rule of RULES) {
    if (rule.keys.some((k) => low.includes(k))) return pick(dict[rule.k]);
  }
  return pick(dict.fallback);
}
