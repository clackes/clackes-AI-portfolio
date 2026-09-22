// Privacy Policy + Terms of Service.
//
// Long-form legal prose lives here rather than in i18n.tsx: the dictionary is
// for short UI strings, and ~60 extra keys of paragraph text would drown it.
// Same bilingual behaviour though — the copy follows the site language.
//
// The Privacy text describes what the app ACTUALLY does (booking → Google
// Calendar, guestbook → guestbook.json, chat → Gemini, localStorage only).
// If those flows change, change this page too.
import { ArrowLeft } from 'lucide-react';
import { useT, useLang } from '@/i18n';
import { navigate } from '@/lib/nav';
import { Navbar } from '@/sections/Navbar';
import { profile } from '@/data/content';

const UPDATED = { en: '22 September 2026', it: '22 settembre 2026' };

type Block = { h: string; p?: string[]; ul?: string[] };

// ── Privacy ────────────────────────────────────────────────────────────────
const privacyEn: Block[] = [
  {
    h: 'Who is responsible',
    p: [
      `This site (albertovergani.com) is a personal portfolio run by ${profile.name}, based in Italy. I am the data controller for everything described below. You can reach me at ${profile.email}.`,
    ],
  },
  {
    h: 'What this site does NOT do',
    p: ['To be clear up front, because most sites do the opposite:'],
    ul: [
      'No tracking cookies, no advertising networks, no third-party analytics.',
      'No profiling, no behavioural targeting, no data sold or shared for marketing.',
      'No newsletter list built quietly in the background.',
    ],
  },
  {
    h: 'Booking a call',
    p: [
      'When you book an intro call, the form collects your name, your email address, an optional note about what you want to discuss, and the date, time and time zone you picked.',
      'That information is used to create an event on my Google Calendar and to let Google send the calendar invitation — including the Google Meet link — to your email address. Your details therefore end up stored in Google Calendar, and Google processes them as described in its own privacy policy.',
      'The legal basis is your request: you are asking me to arrange a meeting, so the processing is necessary to take steps at your request before any agreement.',
      'The event stays in my calendar as part of my meeting history. Ask me and I will delete it.',
    ],
  },
  {
    h: 'Guestbook',
    p: [
      'To leave a message you sign in with GitHub or Google. I request the minimum scope in both cases — GitHub `read:user`, Google `openid profile` — which returns your public display name and avatar image.',
      'What gets stored on my server is: your display name, the URL of your avatar, your message, which provider you used, and the timestamp. Your email address is not requested and not stored.',
      'Your sign-in is kept in a signed token held in your browser\'s localStorage, not in a server-side session and not in a cookie. Clearing your browser storage signs you out.',
      'The legal basis is your consent, given by signing in and posting. Messages stay published until you ask me to remove yours, or until I remove content that breaks the terms.',
    ],
  },
  {
    h: 'AI assistant',
    p: [
      'The "ask me anything" box sends your question, and the earlier messages in that conversation, to Google\'s Gemini API so it can generate an answer. Those messages are processed by Google under its terms. If the service is unavailable, a small built-in set of canned answers replies instead, with nothing leaving the server.',
      'Please do not type personal or confidential information into the chat box. It is a portfolio toy, not a secure channel.',
    ],
  },
  {
    h: 'Storage in your browser',
    p: [
      'This site sets no cookies. It uses localStorage for exactly two things: your language preference, and the guestbook sign-in token described above. Both stay on your device and are never sent anywhere except, for the token, back to this site to verify who is posting.',
    ],
  },
  {
    h: 'Hosting and delivery',
    p: [
      'The site runs on infrastructure I operate myself and is served through Cloudflare. As part of delivering the page, Cloudflare handles connection data such as your IP address and processes it as described in its own privacy policy. Standard server logs may record request data for security and troubleshooting.',
    ],
  },
  {
    h: 'Third parties involved',
    ul: [
      'Google — Calendar (bookings), Gemini (AI assistant), OAuth sign-in.',
      'GitHub — OAuth sign-in for the guestbook.',
      'Cloudflare — delivery and protection of the site.',
    ],
    p: ['Each processes data under its own privacy policy. I do not send your data anywhere else.'],
  },
  {
    h: 'Use of Google user data',
    p: [
      'The use of information received from Google APIs adheres to the Google API Services User Data Policy, including the Limited Use requirements. Concretely: the Google Calendar access is used solely to create the calendar event you requested, it is never used for advertising, it is never sold or transferred to anyone, and no human reads it except as needed for security or to comply with the law.',
    ],
  },
  {
    h: 'Your rights',
    p: [
      'Under the GDPR you can ask for access to your data, correction, erasure, restriction of processing, portability, and you can object to processing. You can also withdraw consent at any time — that does not undo processing already carried out.',
      `Write to ${profile.email} and I will handle it myself; there is no ticketing system to go through. You also have the right to complain to the Italian Data Protection Authority (Garante per la protezione dei dati personali).`,
    ],
  },
  {
    h: 'Children',
    p: ['This site is not aimed at children under 14 and I do not knowingly collect their data.'],
  },
  {
    h: 'Changes',
    p: [
      'If I change how any of this works, I will update this page and the date at the top. Material changes to what happens to data already collected will not be applied retroactively without a new legal basis.',
    ],
  },
];

const privacyIt: Block[] = [
  {
    h: 'Chi è il titolare',
    p: [
      `Questo sito (albertovergani.com) è il portfolio personale di ${profile.name}, con sede in Italia. Sono io il titolare del trattamento per tutto quanto descritto qui sotto. Puoi scrivermi a ${profile.email}.`,
    ],
  },
  {
    h: 'Cosa questo sito NON fa',
    p: ['Lo dico subito, perché la maggior parte dei siti fa il contrario:'],
    ul: [
      'Nessun cookie di tracciamento, nessun circuito pubblicitario, nessuna analytics di terze parti.',
      'Nessuna profilazione, nessun targeting comportamentale, nessun dato venduto o ceduto per marketing.',
      'Nessuna lista newsletter costruita di nascosto.',
    ],
  },
  {
    h: 'Prenotazione di una chiamata',
    p: [
      'Quando prenoti una call conoscitiva, il modulo raccoglie il tuo nome, il tuo indirizzo email, una nota facoltativa su cosa vuoi discutere, e la data, l\'ora e il fuso orario che hai scelto.',
      'Questi dati servono a creare un evento sul mio Google Calendar e a far inviare da Google l\'invito — con il link Google Meet — al tuo indirizzo email. I tuoi dati finiscono quindi memorizzati in Google Calendar, e Google li tratta secondo la propria informativa privacy.',
      'La base giuridica è la tua richiesta: mi stai chiedendo di organizzare un incontro, quindi il trattamento è necessario per eseguire misure precontrattuali adottate su tua richiesta.',
      'L\'evento resta nel mio calendario come parte dello storico degli incontri. Se me lo chiedi, lo cancello.',
    ],
  },
  {
    h: 'Guestbook',
    p: [
      'Per lasciare un messaggio accedi con GitHub o Google. In entrambi i casi richiedo il permesso minimo — GitHub `read:user`, Google `openid profile` — che restituisce il tuo nome pubblico e l\'immagine del profilo.',
      'Sul mio server viene salvato: il nome visualizzato, l\'URL dell\'avatar, il messaggio, il provider usato e la data. Il tuo indirizzo email non viene richiesto né conservato.',
      'L\'accesso è mantenuto tramite un token firmato conservato nel localStorage del tuo browser, non in una sessione lato server e non in un cookie. Svuotando la memoria del browser esci dall\'account.',
      'La base giuridica è il tuo consenso, prestato accedendo e pubblicando. I messaggi restano online finché non mi chiedi di rimuovere il tuo, o finché non rimuovo contenuti che violano i termini.',
    ],
  },
  {
    h: 'Assistente AI',
    p: [
      'Il riquadro "chiedimi quello che vuoi" invia la tua domanda, insieme ai messaggi precedenti di quella conversazione, all\'API Gemini di Google per generare una risposta. Quei messaggi sono trattati da Google secondo i suoi termini. Se il servizio non è raggiungibile, risponde una piccola serie di risposte predefinite interne, senza che nulla esca dal server.',
      'Per favore non scrivere informazioni personali o riservate nella chat. È un giocattolo da portfolio, non un canale sicuro.',
    ],
  },
  {
    h: 'Memoria del browser',
    p: [
      'Questo sito non imposta cookie. Usa il localStorage per esattamente due cose: la tua preferenza di lingua e il token di accesso al guestbook descritto sopra. Entrambi restano sul tuo dispositivo e non vengono inviati altrove, tranne il token che torna a questo sito per verificare chi sta scrivendo.',
    ],
  },
  {
    h: 'Hosting e distribuzione',
    p: [
      'Il sito gira su infrastruttura che gestisco personalmente ed è distribuito tramite Cloudflare. Per consegnarti la pagina, Cloudflare tratta dati di connessione come il tuo indirizzo IP, secondo la propria informativa privacy. I normali log del server possono registrare dati delle richieste per sicurezza e diagnostica.',
    ],
  },
  {
    h: 'Terze parti coinvolte',
    ul: [
      'Google — Calendar (prenotazioni), Gemini (assistente AI), accesso OAuth.',
      'GitHub — accesso OAuth per il guestbook.',
      'Cloudflare — distribuzione e protezione del sito.',
    ],
    p: ['Ciascuno tratta i dati secondo la propria informativa. Non invio i tuoi dati da nessun\'altra parte.'],
  },
  {
    h: 'Uso dei dati utente Google',
    p: [
      'L\'uso delle informazioni ricevute dalle API di Google rispetta la Google API Services User Data Policy, inclusi i requisiti di Limited Use. In concreto: l\'accesso a Google Calendar è usato unicamente per creare l\'evento che hai richiesto, non è mai usato per pubblicità, non è mai venduto né trasferito a nessuno, e nessuna persona lo legge se non per necessità di sicurezza o per obblighi di legge.',
    ],
  },
  {
    h: 'I tuoi diritti',
    p: [
      'In base al GDPR puoi chiedere l\'accesso ai tuoi dati, la rettifica, la cancellazione, la limitazione del trattamento, la portabilità, e puoi opporti al trattamento. Puoi anche revocare il consenso in qualsiasi momento — questo non annulla i trattamenti già effettuati.',
      `Scrivi a ${profile.email} e me ne occupo personalmente; non c'è nessun sistema di ticket da attraversare. Hai inoltre il diritto di proporre reclamo al Garante per la protezione dei dati personali.`,
    ],
  },
  {
    h: 'Minori',
    p: ['Questo sito non si rivolge a minori di 14 anni e non raccolgo consapevolmente i loro dati.'],
  },
  {
    h: 'Modifiche',
    p: [
      'Se cambio il funzionamento di qualcosa, aggiorno questa pagina e la data in alto. Modifiche sostanziali su dati già raccolti non verranno applicate retroattivamente senza una nuova base giuridica.',
    ],
  },
];

// ── Terms ──────────────────────────────────────────────────────────────────
const termsEn: Block[] = [
  {
    h: 'What this is',
    p: [
      `albertovergani.com is the personal portfolio of ${profile.name}. It shows my work and offers a few free features: an AI assistant, a guestbook, and a form to book an intro call. By using the site you accept these terms. If you do not, please just don't use it.`,
    ],
  },
  {
    h: 'Booking a call',
    p: [
      'Booking a slot arranges an informal introductory conversation. It is not a contract for services, not a quote, and not a commitment by either of us to work together.',
      'I may decline, reschedule or cancel a booking — for example if the slot turns out to be double-booked or the request is clearly spam. If you cannot make it, cancel the calendar invitation or send me an email so the slot frees up.',
      'Book in good faith. Repeated no-shows or bookings made to waste time or to advertise something will be cancelled and blocked.',
    ],
  },
  {
    h: 'Guestbook',
    p: ['You are responsible for what you post. Do not post:'],
    ul: [
      'unlawful, defamatory, hateful, harassing or threatening content;',
      'other people\'s personal data;',
      'spam, advertising, or links to malware or scams;',
      'content you do not hold the rights to.',
    ],
  },
  {
    h: 'Guestbook (continued)',
    p: [
      'I can remove any message and block any account, at my discretion and without notice. By posting you grant me permission to display your message and your public name and avatar on the site. You keep whatever rights you had in the content, and you can ask me to take your message down at any time.',
    ],
  },
  {
    h: 'AI assistant',
    p: [
      'The assistant generates text automatically and can be wrong, out of date, or confidently mistaken about me and my work. Treat what it says as an informal starting point, never as professional, legal, financial or technical advice, and never as a binding statement from me. Where it contradicts the rest of the site or something I have told you directly, the latter wins.',
    ],
  },
  {
    h: 'Intellectual property',
    p: [
      'The design, text and code of this site are mine unless stated otherwise. Project names, logos and client work shown in the portfolio may belong to their respective owners and appear here for illustration. Do not reuse the site\'s content as your own; ask me if you want to use something, the answer is usually yes.',
    ],
  },
  {
    h: 'Availability and warranty',
    p: [
      'This is a personal site run on my own infrastructure. It is provided "as is", with no guarantee of availability, accuracy or fitness for any purpose. I may change, break or take down any feature at any time — including the guestbook and everything posted in it, though I will try not to lose your messages.',
    ],
  },
  {
    h: 'Liability',
    p: [
      'To the extent the law allows, I am not liable for indirect or consequential damages arising from use of this site, from downtime, or from reliance on anything the AI assistant produced. Nothing here limits liability that cannot legally be limited, including for wilful misconduct or gross negligence.',
    ],
  },
  {
    h: 'Privacy',
    p: ['How your data is handled is described in the Privacy Policy, which is part of these terms.'],
  },
  {
    h: 'Law and changes',
    p: [
      'These terms are governed by Italian law. If you are a consumer, you keep the protections of the mandatory rules of your country of residence.',
      `I may update these terms; the version published here with the date at the top is the one in force. Questions: ${profile.email}.`,
    ],
  },
];

const termsIt: Block[] = [
  {
    h: 'Cos\'è questo sito',
    p: [
      `albertovergani.com è il portfolio personale di ${profile.name}. Mostra il mio lavoro e offre alcune funzioni gratuite: un assistente AI, un guestbook e un modulo per prenotare una call conoscitiva. Usando il sito accetti questi termini. Se non li accetti, semplicemente non usarlo.`,
    ],
  },
  {
    h: 'Prenotazione di una chiamata',
    p: [
      'Prenotare uno slot serve a fissare una conversazione conoscitiva informale. Non è un contratto di servizi, non è un preventivo e non è un impegno di nessuno dei due a lavorare insieme.',
      'Posso rifiutare, spostare o annullare una prenotazione — per esempio se lo slot risulta doppio o se la richiesta è palesemente spam. Se non riesci a esserci, annulla l\'invito nel calendario o scrivimi una mail, così lo slot si libera.',
      'Prenota in buona fede. Assenze ripetute o prenotazioni fatte per far perdere tempo o per pubblicizzare qualcosa verranno annullate e bloccate.',
    ],
  },
  {
    h: 'Guestbook',
    p: ['Sei responsabile di ciò che pubblichi. Non pubblicare:'],
    ul: [
      'contenuti illeciti, diffamatori, d\'odio, molesti o minacciosi;',
      'dati personali di altre persone;',
      'spam, pubblicità o link a malware o truffe;',
      'contenuti su cui non hai i diritti.',
    ],
  },
  {
    h: 'Guestbook (segue)',
    p: [
      'Posso rimuovere qualsiasi messaggio e bloccare qualsiasi account, a mia discrezione e senza preavviso. Pubblicando mi autorizzi a mostrare il tuo messaggio e il tuo nome pubblico e avatar sul sito. Mantieni i diritti che avevi sul contenuto e puoi chiedermi in qualsiasi momento di rimuovere il tuo messaggio.',
    ],
  },
  {
    h: 'Assistente AI',
    p: [
      'L\'assistente genera testo automaticamente e può sbagliare, essere superato o essere convinto di cose false su di me e sul mio lavoro. Considera quello che dice come un punto di partenza informale, mai come consulenza professionale, legale, finanziaria o tecnica, e mai come una dichiarazione vincolante da parte mia. Dove contraddice il resto del sito o qualcosa che ti ho detto direttamente, vale quest\'ultimo.',
    ],
  },
  {
    h: 'Proprietà intellettuale',
    p: [
      'Il design, i testi e il codice di questo sito sono miei salvo diversa indicazione. Nomi di progetti, loghi e lavori per clienti mostrati nel portfolio possono appartenere ai rispettivi titolari e compaiono a scopo illustrativo. Non riutilizzare i contenuti del sito come se fossero tuoi; chiedimelo se vuoi usare qualcosa, di solito la risposta è sì.',
    ],
  },
  {
    h: 'Disponibilità e garanzie',
    p: [
      'Questo è un sito personale che gira su infrastruttura mia. È fornito "così com\'è", senza garanzia di disponibilità, accuratezza o idoneità a uno scopo specifico. Posso modificare, rompere o rimuovere qualsiasi funzione in qualsiasi momento — compreso il guestbook e tutto ciò che vi è stato pubblicato, anche se farò il possibile per non perdere i tuoi messaggi.',
    ],
  },
  {
    h: 'Responsabilità',
    p: [
      'Nei limiti consentiti dalla legge, non rispondo di danni indiretti o consequenziali derivanti dall\'uso di questo sito, da periodi di inattività o dall\'aver fatto affidamento su quanto prodotto dall\'assistente AI. Nulla qui limita le responsabilità che per legge non possono essere limitate, incluse quelle per dolo o colpa grave.',
    ],
  },
  {
    h: 'Privacy',
    p: ['Il trattamento dei tuoi dati è descritto nell\'Informativa Privacy, che è parte di questi termini.'],
  },
  {
    h: 'Legge applicabile e modifiche',
    p: [
      'Questi termini sono regolati dalla legge italiana. Se sei un consumatore, restano ferme le tutele inderogabili del tuo Paese di residenza.',
      `Posso aggiornare questi termini; fa fede la versione pubblicata qui con la data in alto. Per domande: ${profile.email}.`,
    ],
  },
];

const CONTENT = {
  privacy: { en: privacyEn, it: privacyIt },
  terms: { en: termsEn, it: termsIt },
};

const TITLES = {
  privacy: {
    en: { eyebrow: 'Legal', title: 'Privacy Policy', sub: 'What this site collects, why, and what it refuses to do.' },
    it: { eyebrow: 'Note legali', title: 'Informativa Privacy', sub: 'Cosa raccoglie questo sito, perché, e cosa si rifiuta di fare.' },
  },
  terms: {
    en: { eyebrow: 'Legal', title: 'Terms of Service', sub: 'The rules for using this site and its free features.' },
    it: { eyebrow: 'Note legali', title: 'Termini di Servizio', sub: 'Le regole per usare questo sito e le sue funzioni gratuite.' },
  },
};

export function Legal({ kind }: { kind: 'privacy' | 'terms' }) {
  const t = useT();
  const { lang } = useLang();
  const blocks = CONTENT[kind][lang] ?? CONTENT[kind].en;
  const head = TITLES[kind][lang] ?? TITLES[kind].en;
  const other = kind === 'privacy' ? 'terms' : 'privacy';
  const otherLabel = TITLES[other][lang]?.title ?? TITLES[other].en.title;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* same faint dotted texture as the other standalone pages */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'radial-gradient(currentColor 1px, transparent 0)',
          backgroundSize: '22px 22px',
          color: '#ffffff',
        }}
      />

      <main className="relative mx-auto max-w-2xl px-4 pb-24 pt-28 md:pt-36">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mb-10 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('links.back')}
        </button>

        <header>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-accent">{head.eyebrow}</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tightest text-foreground sm:text-5xl">{head.title}</h1>
          <p className="mt-4 text-muted">{head.sub}</p>
          <p className="mt-6 font-mono text-[11px] uppercase tracking-widest text-muted">
            {lang === 'it' ? 'Ultimo aggiornamento' : 'Last updated'} · {UPDATED[lang] ?? UPDATED.en}
          </p>
        </header>

        <div className="mt-14 flex flex-col gap-10">
          {blocks.map((b, i) => (
            <section key={i}>
              <h2 className="text-xl font-bold tracking-tight text-foreground">{b.h}</h2>
              {b.p?.map((para, j) => (
                <p key={j} className="mt-3 leading-relaxed text-muted">
                  {para}
                </p>
              ))}
              {b.ul && (
                <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 leading-relaxed text-muted marker:text-accent">
                  {b.ul.map((li, j) => (
                    <li key={j}>{li}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        {/* cross-link to the sibling document */}
        <div className="mt-16 border-t border-card-border pt-8">
          <button
            type="button"
            onClick={() => navigate(other === 'privacy' ? '/privacy' : '/terms')}
            className="font-mono text-xs uppercase tracking-widest text-muted transition-colors hover:text-accent"
          >
            {otherLabel} →
          </button>
        </div>
      </main>
    </div>
  );
}
