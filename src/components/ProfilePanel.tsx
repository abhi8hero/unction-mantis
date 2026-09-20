import { ExternalLink, Github, Linkedin, FileText, Globe, Book, TicketIcon } from 'lucide-react';
import { TwinAvatar } from '@/components/TwinAvatar';

const PROFILE = {
  name: 'Abhishek Ugare',
  title: 'Computer Engineer',
  summary:
    'CS Engineer with Hands-on experience building web applications, automation workflows, dashboards, and database driven systems. Familiar with Business Intelligence tool such as PowerBI, Machine Learning concepts, data preprocessing, and AI workflow automation tools such as n8n. Quick learner with strong analytical thinking, problem-solving abilities, and passion for building practical AI-driven solutions.',
  links: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/abhishek-ugare-a289s85k/', icon: Linkedin, },
    { label: 'GitHub', href: 'https://github.com/abhi8hero', icon: Github },
    { label: 'Portfolio', href: 'https://abhi8hero.github.io/portfolio-abhishek_ugare/', icon: Book, },
    { label: 'Resume', href: 'https://abhi8hero.github.io/portfolio-abhishek_ugare/reports/cv1.pdf', icon: FileText, },
    { label: 'Wellfound', href: 'https://wellfound.com/u/a289s85k', icon: Globe, },
    { label: 'Plum Profile', href: 'https://secure.plum.io/en/fp/Ql-YMZEPBkwmVVP70LErMw', icon: TicketIcon, },
  ],
  skills: ['N8N Automation','Power BI','Microsoft Excel','Problem Solving','Tool Adaptability','Decision Making','Analytical & Critical Thinking','Leadership','System Design & Automation','Project Planning', 'Data Analysis', 'AI Workflows'],
};

export function ProfilePanel() {
  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-4">
      {/* Identity */}
      <div className="flex flex-col items-center gap-3 pt-2 text-center">
        <TwinAvatar size="lg" />
        <div>
          <h2 className="font-bold text-foreground text-base">{PROFILE.name}</h2>
          <p className="gallery-label text-[11px] text-primary mt-0.5">{PROFILE.title}</p>
        </div>
        <div className="hairline-pink w-full" />
        <p className="text-xs text-muted-foreground leading-relaxed">{PROFILE.summary}</p>
      </div>

      {/* Quick Skills */}
      <div>
        <p className="gallery-label mb-2 text-[10px] text-muted-foreground">Core Skills</p>
        <div className="flex flex-wrap gap-1.5">
          {PROFILE.skills.map((skill) => (
            <span
              key={skill}
              className="rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Links */}
      <div>
        <p className="gallery-label mb-2 text-[10px] text-muted-foreground">Public Profiles</p>
        <div className="flex flex-col gap-1.5">
          {PROFILE.links.map(({ label, href, icon: Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs text-muted-foreground transition-all duration-150 hover:border-primary hover:text-primary"
            >
              <Icon size={13} className="shrink-0" />
              <span className="flex-1">{label}</span>
              <ExternalLink
                size={11}
                className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
              />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
