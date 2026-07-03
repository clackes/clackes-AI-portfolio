import type { IconType } from 'react-icons';
import { Reveal } from '@/components/Reveal';
import { SkillSphere, type Skill } from '@/components/SkillSphere';
import { useT } from '@/i18n';
import {
  SiPython, SiJavascript, SiTypescript, SiC, SiCplusplus, SiHtml5, SiCss, SiGnubash,
  SiReact, SiNextdotjs, SiNodedotjs, SiBootstrap,
  SiMysql, SiMongodb, SiDocker, SiGit,
  SiGithub, SiCursor, SiIntellijidea, SiPostman,
} from 'react-icons/si';

// A handful of brand logos render better as the real image (exact official
// artwork) than the react-icons glyph — used as plain <img> but wrapped so
// they still slot into the same `Icon: IconType` shape the sphere expects.
function imgIcon(src: string): IconType {
  const ImgIcon: IconType = ({ size, className }) => (
    <img src={src} alt="" className={className} style={{ width: size, height: size, objectFit: 'contain' }} />
  );
  return ImgIcon;
}

// All of Alberto's skills with their real brand logos + colours (dark-logo
// brands use white so they read on the near-black background).
const SKILLS: Skill[] = [
  { name: 'Python', Icon: SiPython, color: '#3776AB' },
  { name: 'JavaScript', Icon: SiJavascript, color: '#F7DF1E' },
  { name: 'TypeScript', Icon: SiTypescript, color: '#3178C6' },
  { name: 'C', Icon: SiC, color: '#A8B9CC' },
  { name: 'C++', Icon: SiCplusplus, color: '#00599C' },
  { name: 'HTML', Icon: SiHtml5, color: '#E34F26' },
  { name: 'CSS', Icon: SiCss, color: '#663399' },
  { name: 'Bash', Icon: SiGnubash, color: '#4EAA25' },
  { name: 'React', Icon: SiReact, color: '#61DAFB' },
  { name: 'Next.js', Icon: SiNextdotjs, color: '#ffffff' },
  { name: 'Node.js', Icon: SiNodedotjs, color: '#339933' },
  { name: 'Flask', Icon: imgIcon('/skill-logos/flask.webp'), color: '#ffffff' },
  { name: 'FastAPI', Icon: imgIcon('/skill-logos/fastapi.webp'), color: '#009688' },
  { name: 'Bootstrap', Icon: SiBootstrap, color: '#7952B3' },
  { name: 'Tailwind', Icon: imgIcon('/skill-logos/tailwind.webp'), color: '#06B6D4' },
  { name: 'NumPy', Icon: imgIcon('/skill-logos/numpy.webp'), color: '#4DABCF' },
  { name: 'pandas', Icon: imgIcon('/skill-logos/pandas.webp'), color: '#E70488' },
  { name: 'MySQL', Icon: SiMysql, color: '#4479A1' },
  { name: 'PostgreSQL', Icon: imgIcon('/skill-logos/postgresql.webp'), color: '#4169E1' },
  { name: 'MongoDB', Icon: SiMongodb, color: '#47A248' },
  { name: 'Redis', Icon: imgIcon('/skill-logos/redis.webp'), color: '#DC382D' },
  { name: 'Docker', Icon: SiDocker, color: '#2496ED' },
  { name: 'Git', Icon: SiGit, color: '#F05032' },
  { name: 'GitHub', Icon: SiGithub, color: '#ffffff' },
  { name: 'Linux', Icon: imgIcon('/skill-logos/linux.webp'), color: '#FCC624' },
  { name: 'VS Code', Icon: imgIcon('/skill-logos/vscode.webp'), color: '#007ACC' },
  { name: 'Cursor', Icon: SiCursor, color: '#ffffff' },
  { name: 'IntelliJ IDEA', Icon: SiIntellijidea, color: '#087CFA' },
  { name: 'Figma', Icon: imgIcon('/skill-logos/figma.svg'), color: '#F24E1E' },
  { name: 'Postman', Icon: SiPostman, color: '#FF6C37' },
  { name: 'Hugging Face', Icon: imgIcon('/skill-logos/huggingface.webp'), color: '#FFD21E' },
];

export function Skills() {
  const t = useT();
  return (
    <section id="skills" className="relative overflow-hidden px-4 pb-24 pt-8" style={{ scrollMarginTop: 100 }}>
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <p className="text-center font-bold uppercase tracking-widest text-accent">{t('skills.eyebrow')}</p>
          <h2 className="mt-2 text-center text-3xl font-bold tracking-tightest text-foreground sm:text-5xl md:text-6xl">
            {t('skills.title.pre')}<span className="gradient-shimmer">{t('skills.title.accent')}</span>
          </h2>
        </Reveal>

        <SkillSphere skills={SKILLS} className="mt-2 h-[440px] w-full sm:h-[560px] md:h-[640px]" />
      </div>
    </section>
  );
}
