import { useEffect, useState } from 'react';
import { useSmoothScroll } from '@/hooks/useSmoothScroll';
import { Navbar } from '@/sections/Navbar';
import { Hero } from '@/sections/Hero';
import { About } from '@/sections/About';
import { Skills } from '@/sections/Skills';
import { Work } from '@/sections/Work';
import { Other } from '@/sections/Other';
import { Footer } from '@/sections/Footer';
import { Guestbook } from '@/sections/Guestbook';
import { BookCall } from '@/sections/BookCall';
import { Links } from '@/sections/Links';
import { Sponsor } from '@/sections/Sponsor';
import { Legal } from '@/sections/Legal';
import { GetInTouch } from '@/components/GetInTouch';
import { useT } from '@/i18n';

export default function App() {
  useSmoothScroll();
  const t = useT();
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  let page;
  if (path === '/guestbook') {
    page = <Guestbook />;
  } else if (path === '/book-call') {
    page = <BookCall />;
  } else if (path === '/links') {
    page = <Links />;
  } else if (path === '/sponsor') {
    page = <Sponsor />;
  } else if (path === '/privacy') {
    page = <Legal kind="privacy" />;
  } else if (path === '/terms') {
    page = <Legal kind="terms" />;
  } else {
    page = (
      <>
        <a href="#main" className="skip-link">
          {t('skip')}
        </a>
        <Navbar />
        <main id="main">
          <Hero />
          <About />
          <Work />
          <Skills />
          <Other />
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      {page}
      {/* Global slide-up contact panel — reachable from the navbar/footer on any route. */}
      <GetInTouch />
    </>
  );
}
