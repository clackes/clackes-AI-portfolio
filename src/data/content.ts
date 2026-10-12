export const profile = {
  name: 'Alberto Vergani',
  brand: 'Alberto Vergani',
  initials: 'AV',
  role: 'Developer · AI Builder · Social Media',
  tagline: 'Built end to end. Made to travel.',
  location: 'Italy · Switzerland · Online',
  // placeholders — replace with your real handles once the new accounts exist
  email: 'albertovergani267@gmail.com',
  // short hook for the hero
  intro:
    "Full-stack developer who builds with AI like it's 2026, with an engineer's read on what makes short-form video work on Instagram and TikTok.",
  // fuller story for the About section — deliberately plain, no jargon.
  bio: [
    `Engineering student in Lugano, Switzerland. I build things that live on the internet: websites, apps, and small automated helpers that do the boring work for you.`,
    `I take an idea from the first sketch to the moment it goes live and people actually use it. When it makes sense, I also get it in front of the right people on social.`,
  ],
  socials: [
    { label: 'Email', href: 'mailto:albertovergani267@gmail.com', handle: 'alberto.vergani' },
    { label: 'GitHub', href: 'https://github.com/clackes', handle: '@clackes' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/alberto-vergani', handle: 'in/alberto-vergani' },
  ],
};

// Universal capability words — rendered as a floating cloud. Kept jargon-free
// so a non-technical visitor gets the gist at a glance.
export const tools = ['Websites', 'Apps', 'Automation', 'Social', 'Video', 'Design', 'Content'];

// ============================================================================
// MY SKILLS  — grouped for the Skills section.
// EDIT ME: tell Claude what to remove/add and this list gets updated.
// ============================================================================
export const skillGroups: { title: string; items: string[] }[] = [
  {
    title: 'Languages',
    items: ['Python', 'JavaScript', 'TypeScript', 'C', 'C++', 'HTML', 'CSS', 'Bash'],
  },
  {
    title: 'Frameworks & Libraries',
    items: ['React', 'Next.js', 'Node.js', 'Flask', 'FastAPI', 'Bootstrap', 'Tailwind', 'NumPy', 'pandas'],
  },
  {
    title: 'Databases',
    items: ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis'],
  },
  {
    title: 'Tools & Platforms',
    items: ['Docker', 'Git', 'GitHub', 'Linux', 'VS Code', 'Cursor', 'IntelliJ IDEA', 'Figma', 'Postman', 'Hugging Face'],
  },
];

// Merged manifesto: what I stand for + what I build + how I build it.
// Rendered as three columns in the About bento (copy lives in i18n).
export const principles = [
  { n: '01', title: "I don't quit", body: "If I don't know it, I learn it. Curiosity and stubbornness are my method." },
  { n: '02', title: 'I see the whole system', body: 'From OS to cloud, from backend to database: I know how the pieces fit together.' },
  { n: '03', title: 'I put AI to work', body: 'Not a buzzword: agents that automate analysis and busywork, so time goes where it counts.' },
];

// Projects — one list. Cards render by `kind`; clicking opens the detail view.
export type ProjectLink = { label: string; href: string };

export type Project = {
  slug: string;
  kind: 'build' | 'client'; // 'build' = spec card, 'client' = image card
  name: string;
  tagline: string;
  meta: string; // small stack/category signal
  blurb: string; // short card text
  description: string; // longer copy on the detail page
  tags: string[];
  bullets?: string[]; // build cards only
  image?: string; // client card cover + first detail image
  domain?: string; // client card
  // detail-page meta:
  year: string;
  client: string;
  link?: ProjectLink; // "Link" row on the detail page
  images: string[]; // detail gallery (placeholders until real shots land)
};

export const projects: Project[] = [
  {
    slug: 'kcal-tracker',
    kind: 'build',
    name: 'Kcal Tracker',
    tagline: 'A food app that tells you what to eat, not just what you ate',
    meta: 'Personal project · App',
    blurb:
      "Almost nobody keeps logging meals. So the app flips it: tell it what's in your fridge and it suggests three meals for right now. Picking one logs it. Installs on your phone like any other app.",
    description:
      'Calorie trackers fail because logging is a chore that pays off weeks later, if ever. Kcal Tracker turns the question around: instead of "what did you eat?" it answers "what should I eat now?". You keep a list of what\'s at home; at any hour, "I\'m hungry" gives three options for that meal built from it (meat first, since it spoils fastest), and choosing one logs it. In the evening it plans tomorrow\'s packed lunch and snacks. Photo, barcode and quick lists cover everything else, with quests, streaks and quiet hours for notifications. Installs on the phone and works offline.',
    bullets: [
      'Tell it what\'s in the fridge: "I\'m hungry" suggests three meals for right now, and picking one logs it.',
      'Plans tomorrow\'s packed lunch and snacks in the evening, sized to make up for a light breakfast.',
      'AI daily menu that adapts to training before or after the meal, plus photo and barcode logging.',
      'Installs like a phone app, works offline, with quiet hours so notifications stay out of the way.',
    ],
    tags: ['FastAPI', 'PostgreSQL', 'React', 'TypeScript', 'Gemini', 'PWA'],
    image: '/kcal-cover.webp',
    year: '2026',
    client: 'Personal project',
    images: ['/kcal-1.webp', '/kcal-2.webp', '/kcal-4.webp'],
  },
  {
    slug: 'baumarine',
    kind: 'client',
    name: 'Baumarine',
    tagline: 'Italian luxury yacht shipyard',
    meta: 'Client work · Design & build',
    blurb:
      'A site for a premium yacht builder on Lake Iseo: quiet, editorial, and built to feel as considered as the yachts themselves. Design, art direction and copy are mine.',
    description:
      'A site for a premium yacht builder on Lake Iseo. The brief was quiet and editorial: let the boats carry the page. I handled the design, art direction and copy, with a build and hosting setup tuned for a small luxury brand.',
    tags: ['WordPress', 'Aruba', 'Plesk', 'Art direction'],
    image: '/baumarine.webp',
    domain: 'baumarine.it',
    year: '2025',
    client: 'Baumarine',
    link: { label: 'Visit website', href: 'https://baumarine.it' },
    images: ['/baumarine.webp'],
  },
  {
    slug: 'rosalber',
    kind: 'build',
    name: 'Agriturismo Rosalber',
    tagline: 'A farm stay in the woods above Varese',
    meta: 'Personal project · Website',
    blurb:
      'A site for a farm stay in the woods near Varese: wild game cooking, archery, events by the pond and rooms to stay over. Drone footage up front, one page for each side of the place.',
    description:
      'A website for Agriturismo Rosalber in Castello Cabiaglio (Varese): three hectares of woods with a restaurant, archery ranges, a pond for events and rooms to stay over. The page opens on drone footage and splits the place into four doors (table, adventure, events, rooms) so every visitor finds their way in. Design, copy and build are mine.',
    tags: ['Next.js', 'React', 'TypeScript', 'Tailwind', 'Motion', 'Netlify'],
    image: '/rosalber.webp',
    domain: 'agriturismorosalber.com',
    year: '2026',
    client: 'Personal project',
    link: { label: 'Visit website', href: 'https://agriturismorosalber.com/' },
    images: ['/rosalber.webp'],
  },
];

// The working process — 4 steps.
export const experience = [
  {
    range: 'Goals & constraints',
    role: 'Scope',
    org: 'Step 01',
    summary:
      'We pin down what winning looks like, and what we are not building. Clear targets beat clever guesses every time.',
    chips: ['Goals', 'Constraints', 'Plan'],
  },
  {
    range: 'Product & AI',
    role: 'Build',
    org: 'Step 02',
    summary:
      'Full-stack development with AI in the stack: clean APIs, real data, and agents put exactly where they earn their keep.',
    chips: ['Full-stack', 'Agents', 'APIs'],
  },
  {
    range: 'Deploy & launch',
    role: 'Ship',
    org: 'Step 03',
    summary:
      'Live on solid infrastructure, not a localhost demo: Docker, monitoring, and a launch that actually goes out the door.',
    chips: ['Deploy', 'Infra', 'Launch'],
  },
  {
    range: 'Social & reach',
    role: 'Grow',
    org: 'Step 04',
    summary:
      'Content built for how Instagram and TikTok actually rank it: strategy, short-form video produced with AI, and iteration on whatever spreads.',
    chips: ['Strategy', 'IG / TikTok', 'AI video'],
  },
];
