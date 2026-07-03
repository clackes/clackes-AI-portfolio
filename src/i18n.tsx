import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type Lang = 'en' | 'it';

type Dict = Record<string, string>;

const en: Dict = {
  'skip': 'Skip to content',

  'nav.home': 'Home',
  'nav.about': 'About',
  'nav.projects': 'Projects',
  'nav.skills': 'Skills',
  'nav.other': 'Other',
  'nav.book': 'Book a Call',
  'nav.lang.label': 'Language',

  'hero.availability': 'Open to collaboration & freelance',
  'hero.greeting': "Hi, I'm",
  'hero.askEmpty': 'Ask me anything about',
  'hero.askPlaceholder': 'Ask anything about',
  'hero.askAria': 'Ask the AI assistant a question',
  'hero.askSubmit': 'Ask',
  'hero.errorAI': "Couldn't reach the AI service. Please try again in a moment.",
  'hero.errorWrong': 'Sorry, something went wrong.',
  'hero.scroll': 'Scroll to explore',
  'hero.quick.work': 'Work',
  'hero.quick.about': 'About me',
  'hero.quick.skills': 'Skills',
  'hero.quick.contact': 'Contact',

  'about.role': 'Developer · AI Engineer · Social Media',

  'about.principles.hint': 'Hover to read more',
  'about.principles.01.title': "I don't give up",
  'about.principles.01.body': "Curiosity and stubbornness got me here. When I don't know something, I learn it — and keep going.",
  'about.principles.02.title': 'I cover the whole stack',
  'about.principles.02.body': 'Windows, Linux, macOS, Docker on cloud VPS, Python, C++, JavaScript, SQL and NoSQL — I get how the whole system fits together, not just one piece.',
  'about.principles.03.title': 'I put AI to work',
  'about.principles.03.body': "Not a buzzword on a slide: AI agents that actually automate analysis and busywork, so my time goes where it matters.",

  'about.mindset.title': 'Mindset',
  'about.mindset.line1.strong': 'Building more than software.',
  'about.mindset.line1.rest': ' Curiosity and consistency are the discipline that keeps me shipping.',
  'about.mindset.line2.strong': 'Sharp off-screen, sharp on it',
  'about.mindset.line2.rest': " — that's the whole game.",
  'about.mindset.photo.passione': 'Passion',
  'about.mindset.photo.school': 'School',
  'about.mindset.photo.energy': 'Energy',
  'about.mindset.photo.gym': 'Gym',
  'about.mindset.photo.ski': 'Skiing',

  'about.portrait.label': 'Portrait',

  'about.craft.title': 'Craft',
  'about.craft.line1.pre': 'Building scalable ',
  'about.craft.line1.strong': 'apps, websites, and automations',
  'about.craft.line1.post': '.',
  'about.craft.line2': 'AI put exactly where it earns its keep — so I can advise on the solution a business actually needs.',
  'about.craft.availability': 'Open to collaboration & freelance',

  'skills.eyebrow': 'Tech Stack',
  'skills.title.pre': 'My ',
  'skills.title.accent': 'Skills',

  'work.eyebrow': 'Portfolio',
  'work.title': 'Featured Projects',
  'work.subtitle': 'A curated selection of work — real products with real users, not demos.',
  'work.category.client': 'Client Website',
  'work.category.build': 'Web / PWA App',
  'work.link.visit': 'Visit website',
  'work.kcal-tracker.blurb': 'Scan a barcode, log a meal in two taps, watch how your week is going. Installs on your phone like any other app.',
  'work.baumarine.blurb': 'A site for a premium yacht builder on Lake Iseo: quiet, editorial, and built to feel as considered as the yachts themselves. Design, art direction and copy are mine.',

  'other.title.pre': 'More to ',
  'other.title.accent': 'Explore',
  'other.subtitle': 'Check out these additional resources and connect with me',
  'other.explore': 'Explore',
  'other.guestbook.title': 'Guestbook',
  'other.guestbook.desc': 'Leave your mark and see what others have to say',
  'other.sponsor.title': 'Sponsor',
  'other.sponsor.desc': 'Support my open-source work on GitHub',
  'other.links.title': 'My Links',
  'other.links.desc': 'Find me across the web and social platforms',

  'footer.contributions': 'Contributions',
  'footer.gameMode': 'try “Game Mode” →',
  'footer.nav.about': 'About',
  'footer.nav.skills': 'Skills',
  'footer.nav.work': 'Work',
  'footer.nav.contact': 'Contact',

  'guest.back': 'Back to home',
  'guest.eyebrow': 'The Community Wall',
  'guest.title.pre': 'Leave Your ',
  'guest.title.accent': 'Mark',
  'guest.subtitle': 'Share your thoughts, feedback, or just say hi!',
  'guest.signedInAs': 'Signed in as',
  'guest.signOut': 'Sign out',
  'guest.placeholder': 'Write something nice…',
  'guest.pin': 'Pin message',
  'guest.pinning': 'Pinning…',
  'guest.prompt': 'Sign in to pin your message to this board forever.',
  'guest.github': 'Sign in with GitHub',
  'guest.google': 'Sign in with Google',
  'guest.demo': 'Continue to sign the board',
  'guest.oauthHint': 'Add GitHub / Google OAuth keys in .env to enable real sign-in.',
  'guest.errAuth': 'Sign-in failed. Try again.',
  'guest.errPost': 'Could not post your message.',
  'guest.errOffline': "Couldn't reach the board. Please check your connection and try again.",
  'guest.namePrompt': 'Your name for the guestbook:',
  'guest.time.now': 'just now',
  'guest.time.m': 'm ago',
  'guest.time.h': 'h ago',
  'guest.time.d': 'd ago',
  'guest.time.mo': 'mo ago',

  // Get in touch panel
  'contact.title': 'Get in touch',
  'contact.subtitle': "Let's build something great together.",
  'contact.book.title': 'Book a call',
  'contact.book.sub': '30 MIN CALL',
  'contact.email.title': 'Email me',
  'contact.email.sub': 'OPEN GMAIL',
  'contact.copy': 'Copy email address',
  'contact.copied': 'Copied!',
  'contact.close': 'Close',

  // Book a call page
  'book.back': 'Back to home',
  'book.title.pre': "Let's bring your ",
  'book.title.accent': 'ideas',
  'book.title.post': ' to life',
  'book.subtitle': 'Select a date and time below to schedule our call.',
  'book.info.confirm': 'Confirmation required',
  'book.info.duration': '30 min session',
  'book.info.meet': 'Google Meet',
  'book.info.place': 'Italy, Switzerland',
  'book.slots.title': 'Available slots',
  'book.slots.tz': 'Times shown in',
  'book.slots.pick': 'Pick a date to see available times.',
  'book.slots.none': 'No slots left for this day.',
  'book.form.name': 'Full name',
  'book.form.name.ph': 'John Smith',
  'book.form.email': 'Email address',
  'book.form.email.ph': 'john.smith@example.com',
  'book.form.topic': 'Topic',
  'book.form.topic.ph': 'I need a website for my business and want to discuss my vision with you.',
  'book.confirm': 'Confirm booking',
  'book.confirming': 'Booking…',
  'book.error.fields': 'Please enter your name, a valid email, and pick a date and time.',
  'book.error.fail': 'Could not complete the booking. Please try again.',
  'book.success.title': "You're booked!",
  'book.success.body': 'Check your inbox — the calendar invite with the Google Meet link is on its way.',
  'book.success.another': 'Book another time',

  // My Links page
  'links.back': 'Back to home',
  'links.eyebrow': 'Connect with me',
  'links.title.pre': 'My ',
  'links.title.accent': 'Links',
  'links.subtitle': 'Find me across the web and social platforms',
};

const it: Dict = {
  'skip': 'Vai al contenuto',

  'nav.home': 'Home',
  'nav.about': 'Chi sono',
  'nav.projects': 'Progetti',
  'nav.skills': 'Competenze',
  'nav.other': 'Altro',
  'nav.book': 'Prenota una call',
  'nav.lang.label': 'Lingua',

  'hero.availability': 'Disponibile per collaborazioni e freelance',
  'hero.greeting': 'Ciao, sono',
  'hero.askEmpty': 'Chiedimi qualsiasi cosa su',
  'hero.askPlaceholder': 'Chiedi qualsiasi cosa su',
  'hero.askAria': "Fai una domanda all'assistente AI",
  'hero.askSubmit': 'Chiedi',
  'hero.errorAI': 'Non riesco a contattare il servizio AI. Riprova tra un momento.',
  'hero.errorWrong': 'Qualcosa è andato storto.',
  'hero.scroll': 'Scorri per esplorare',
  'hero.quick.work': 'Progetti',
  'hero.quick.about': 'Chi sono',
  'hero.quick.skills': 'Competenze',
  'hero.quick.contact': 'Contatti',

  'about.role': 'Sviluppatore · AI Engineer · Social Media',

  'about.principles.hint': 'Passa il mouse per leggere',
  'about.principles.01.title': 'Non mollo mai',
  'about.principles.01.body': 'Curiosità e testardaggine mi hanno portato fin qui. Se non so una cosa, la imparo — e vado avanti.',
  'about.principles.02.title': 'Conosco tutto lo stack',
  'about.principles.02.body': 'Windows, Linux, macOS, Docker su VPS in cloud, Python, C++, JavaScript, SQL e NoSQL — capisco come si incastra il sistema intero, non solo un pezzo.',
  'about.principles.03.title': "Metto l'AI al lavoro",
  'about.principles.03.body': 'Non uno slogan da slide: agenti IA che automatizzano davvero analisi e lavoro ripetitivo, così il mio tempo va dove conta.',

  'about.mindset.title': 'Mentalità',
  'about.mindset.line1.strong': 'Costruire più che software.',
  'about.mindset.line1.rest': ' Curiosità e costanza sono la disciplina che mi tiene a spedire.',
  'about.mindset.line2.strong': 'Lucido fuori dallo schermo, lucido davanti',
  'about.mindset.line2.rest': ' — è tutto il gioco.',
  'about.mindset.photo.passione': 'Passione',
  'about.mindset.photo.school': 'Scuola',
  'about.mindset.photo.energy': 'Energia',
  'about.mindset.photo.gym': 'Palestra',
  'about.mindset.photo.ski': 'Sci',

  'about.portrait.label': 'Ritratto',

  'about.craft.title': 'Mestiere',
  'about.craft.line1.pre': 'Costruisco ',
  'about.craft.line1.strong': 'app, siti e automazioni scalabili',
  'about.craft.line1.post': '.',
  'about.craft.line2': "AI messa esattamente dove serve — così posso consigliare la soluzione di cui un business ha davvero bisogno.",
  'about.craft.availability': 'Disponibile per collaborazioni e freelance',

  'skills.eyebrow': 'Tecnologie',
  'skills.title.pre': 'Le mie ',
  'skills.title.accent': 'competenze',

  'work.eyebrow': 'Portfolio',
  'work.title': 'Progetti in evidenza',
  'work.subtitle': 'Una selezione di lavori — prodotti reali con utenti reali, non demo.',
  'work.category.client': 'Sito cliente',
  'work.category.build': 'App Web / PWA',
  'work.link.visit': 'Visita il sito',
  'work.kcal-tracker.blurb': "Scansiona un codice a barre, registra un pasto in due tap, guarda com'è andata la settimana. Si installa sul telefono come una qualsiasi app.",
  'work.baumarine.blurb': "Un sito per un costruttore di yacht di lusso sul Lago d'Iseo: sobrio, editoriale, pensato per trasmettere la stessa cura dei suoi yacht. Design, art direction e copy sono miei.",

  'other.title.pre': 'Altro da ',
  'other.title.accent': 'esplorare',
  'other.subtitle': 'Dai unʼocchiata a queste risorse e scrivimi',
  'other.explore': 'Esplora',
  'other.guestbook.title': 'Guestbook',
  'other.guestbook.desc': 'Lascia il tuo segno e leggi cosa dicono gli altri',
  'other.sponsor.title': 'Sponsor',
  'other.sponsor.desc': 'Sostieni il mio lavoro open-source su GitHub',
  'other.links.title': 'I miei link',
  'other.links.desc': 'Trovami sul web e sui social',

  'footer.contributions': 'Contributi',
  'footer.gameMode': 'prova la “Game Mode” →',
  'footer.nav.about': 'Chi sono',
  'footer.nav.skills': 'Competenze',
  'footer.nav.work': 'Progetti',
  'footer.nav.contact': 'Contatti',

  'guest.back': 'Torna alla home',
  'guest.eyebrow': 'Il muro della community',
  'guest.title.pre': 'Lascia il tuo ',
  'guest.title.accent': 'segno',
  'guest.subtitle': 'Condividi un pensiero, un feedback o un semplice saluto!',
  'guest.signedInAs': 'Connesso come',
  'guest.signOut': 'Esci',
  'guest.placeholder': 'Scrivi qualcosa di gentile…',
  'guest.pin': 'Pubblica messaggio',
  'guest.pinning': 'Pubblico…',
  'guest.prompt': 'Accedi per lasciare il tuo messaggio per sempre.',
  'guest.github': 'Accedi con GitHub',
  'guest.google': 'Accedi con Google',
  'guest.demo': 'Prosegui per firmare il muro',
  'guest.oauthHint': 'Aggiungi le chiavi OAuth GitHub / Google in .env per abilitare il login reale.',
  'guest.errAuth': 'Accesso fallito. Riprova.',
  'guest.errPost': 'Non è stato possibile pubblicare il messaggio.',
  'guest.errOffline': 'Non riesco a contattare il muro. Controlla la connessione e riprova.',
  'guest.namePrompt': 'Il tuo nome per il guestbook:',
  'guest.time.now': 'adesso',
  'guest.time.m': 'm fa',
  'guest.time.h': 'h fa',
  'guest.time.d': 'g fa',
  'guest.time.mo': 'mesi fa',

  // Get in touch panel
  'contact.title': 'Mettiamoci in contatto',
  'contact.subtitle': 'Costruiamo qualcosa di grande insieme.',
  'contact.book.title': 'Prenota una call',
  'contact.book.sub': 'CALL DA 30 MIN',
  'contact.email.title': 'Scrivimi',
  'contact.email.sub': 'APRI GMAIL',
  'contact.copy': "Copia l'indirizzo email",
  'contact.copied': 'Copiato!',
  'contact.close': 'Chiudi',

  // Book a call page
  'book.back': 'Torna alla home',
  'book.title.pre': 'Diamo vita alle tue ',
  'book.title.accent': 'idee',
  'book.title.post': '',
  'book.subtitle': 'Scegli data e ora qui sotto per fissare la nostra call.',
  'book.info.confirm': 'Conferma richiesta',
  'book.info.duration': 'Sessione da 30 min',
  'book.info.meet': 'Google Meet',
  'book.info.place': 'Italia, Svizzera',
  'book.slots.title': 'Slot disponibili',
  'book.slots.tz': 'Orari mostrati in',
  'book.slots.pick': 'Scegli una data per vedere gli orari disponibili.',
  'book.slots.none': 'Nessuno slot disponibile per questo giorno.',
  'book.form.name': 'Nome completo',
  'book.form.name.ph': 'Mario Rossi',
  'book.form.email': 'Indirizzo email',
  'book.form.email.ph': 'mario.rossi@example.com',
  'book.form.topic': 'Argomento',
  'book.form.topic.ph': 'Mi serve un sito per la mia attività e vorrei discutere la mia idea con te.',
  'book.confirm': 'Conferma prenotazione',
  'book.confirming': 'Prenotazione…',
  'book.error.fields': 'Inserisci il tuo nome, unʼemail valida e scegli data e ora.',
  'book.error.fail': 'Non è stato possibile completare la prenotazione. Riprova.',
  'book.success.title': 'Prenotazione confermata!',
  'book.success.body': 'Controlla la tua email — lʼinvito col link Google Meet sta arrivando.',
  'book.success.another': 'Prenota un altro orario',

  // My Links page
  'links.back': 'Torna alla home',
  'links.eyebrow': 'Connettiamoci',
  'links.title.pre': 'I miei ',
  'links.title.accent': 'Link',
  'links.subtitle': 'Trovami sul web e sui social',
};

const dicts: Record<Lang, Dict> = { en, it };

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
};

const LangCtx = createContext<Ctx | null>(null);

const STORAGE_KEY = 'av_lang';

function detectInitial(): Lang {
  if (typeof window === 'undefined') return 'en';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'en' || stored === 'it') return stored;
  const nav = window.navigator.language?.toLowerCase() ?? '';
  return nav.startsWith('it') ? 'it' : 'en';
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => detectInitial());

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore quota / privacy errors */
    }
  }, []);

  const t = useCallback((key: string) => dicts[lang][key] ?? dicts.en[key] ?? key, [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);
  return <LangCtx.Provider value={value}>{children}</LangCtx.Provider>;
}

export function useLang() {
  const ctx = useContext(LangCtx);
  if (!ctx) throw new Error('useLang must be used inside <LangProvider>');
  return ctx;
}

export function useT() {
  const ctx = useContext(LangCtx);
  return ctx ? ctx.t : (key: string) => key;
}
