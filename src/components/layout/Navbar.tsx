import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";

export const Navbar = () => {
  const { pathname } = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 h-16 border-b border-line/70 bg-paper/80 backdrop-blur-md">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6 md:px-10">
        <Link
          to="/"
          className="group flex items-baseline gap-2"
          aria-label="Lofigen home"
        >
          <span className="font-display text-[22px] tracking-tight text-ink leading-none" style={{ fontVariationSettings: '"SOFT" 100, "opsz" 144, "wght" 500' }}>
            lofigen
          </span>
          <span className="spec hidden md:inline-block">v.02</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a href="/#features" className="link-underline text-sm text-ink-soft hover:text-ink transition-colors">
            Features
          </a>
          <a href="/#sound" className="link-underline text-sm text-ink-soft hover:text-ink transition-colors">
            Sound
          </a>
          <a href="/#voices" className="link-underline text-sm text-ink-soft hover:text-ink transition-colors">
            Voices
          </a>
        </div>

        <div className="flex items-center gap-3">
          {pathname !== "/create" && (
            <Link to="/create">
              <Button variant="primary" size="sm" iconRight={<ArrowUpRight className="h-3.5 w-3.5" />}>
                Open studio
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};
