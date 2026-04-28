import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="relative mt-32 border-t border-line bg-paper">
      <div className="mx-auto max-w-7xl px-6 md:px-10 py-20">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="font-display text-[clamp(2.5rem,7vw,4.5rem)] leading-[0.95] text-ink"
                 style={{ fontVariationSettings: '"SOFT" 100, "opsz" 144, "wght" 400' }}>
              Make your tracks<br />
              <span className="italic text-sienna" style={{ fontVariationSettings: '"SOFT" 100, "opsz" 144, "wght" 400' }}>
                feel like a memory.
              </span>
            </div>
            <div className="mt-10 flex items-center gap-3">
              <div className="tape-reel h-3 w-3 animate-tape" />
              <span className="spec">Recording in browser · No upload to server</span>
            </div>
          </div>

          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <FooterColumn
              label="Studio"
              links={[
                { label: "Features", href: "/#features" },
                { label: "Sound", href: "/#sound" },
                { label: "Open the studio", href: "/create", isInternal: true },
              ]}
            />
            <FooterColumn
              label="Listen"
              links={[
                { label: "Presets", href: "/#presets" },
                { label: "Voices", href: "/#voices" },
              ]}
            />
            <FooterColumn
              label="Project"
              links={[
                { label: "GitHub", href: "https://github.com" },
                { label: "Contact", href: "mailto:hi@lofigen.app" },
              ]}
            />
          </div>
        </div>

        <div className="mt-20 flex flex-col-reverse gap-4 border-t border-line pt-8 md:flex-row md:items-center md:justify-between">
          <p className="spec">© {new Date().getFullYear()} Lofigen — built with care.</p>
          <div className="flex items-center gap-6 text-sm text-ink-mute">
            <a href="#" className="link-underline hover:text-ink">Privacy</a>
            <a href="#" className="link-underline hover:text-ink">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

interface FooterColumnProps {
  label: string;
  links: { label: string; href: string; isInternal?: boolean }[];
}

const FooterColumn = ({ label, links }: FooterColumnProps) => (
  <div>
    <h4 className="spec mb-5">{label}</h4>
    <ul className="space-y-3 text-sm text-ink-soft">
      {links.map((link) => (
        <li key={link.label}>
          {link.isInternal ? (
            <Link to={link.href} className="link-underline hover:text-ink">
              {link.label}
            </Link>
          ) : (
            <a href={link.href} className="link-underline hover:text-ink">
              {link.label}
            </a>
          )}
        </li>
      ))}
    </ul>
  </div>
);
