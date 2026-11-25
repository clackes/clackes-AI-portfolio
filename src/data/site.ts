// Site content managed from Nexus. The server injects the published version
// (or the draft, in preview) as window.__PORTFOLIO__ before the bundle runs;
// without it (local dev, or the injection failing) the built-in defaults apply.
import defaults from '../../server/default-content.json';

export type Lang = 'en' | 'it';
export type Localized = { en: string; it: string };

export type SiteProject = {
  slug: string;
  kind: 'build' | 'client';
  hidden?: boolean;
  name: string;
  tagline: Localized;
  blurb: Localized;
  description: Localized;
  tags: string[];
  image?: string;
  phones?: string[]; // three screens → phone mockup instead of the window mockup
  domain?: string;
  year: string;
  client: string;
  link?: string;
  gradient?: number;
};

export type SiteSkill = { name: string; logo?: string; color?: string; hidden?: boolean };

export type SiteContent = {
  v: number;
  profile: { email: string; socials: { label: string; href: string; handle: string }[] };
  projects: SiteProject[];
  skills: SiteSkill[];
  texts: Record<Lang, Record<string, string>>;
  assistant: { extra: string };
};

declare global {
  interface Window {
    __PORTFOLIO__?: SiteContent;
    __PORTFOLIO_PREVIEW__?: boolean;
  }
}

export function siteData(): SiteContent {
  const injected = typeof window !== 'undefined' ? window.__PORTFOLIO__ : undefined;
  return injected && Array.isArray(injected.projects) ? injected : (defaults as SiteContent);
}

/** Text in the visitor's language, falling back to English. */
export const loc = (v: Localized | string | undefined, lang: Lang) =>
  typeof v === 'string' ? v : (v?.[lang] || v?.en || '');
