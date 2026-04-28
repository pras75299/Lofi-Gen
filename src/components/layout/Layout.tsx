import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

interface LayoutProps {
  children: React.ReactNode;
  /** Hide footer on app-style pages (e.g. /create) */
  bareFooter?: boolean;
}

export const Layout = ({ children, bareFooter }: LayoutProps) => {
  return (
    <div className="relative min-h-screen flex flex-col bg-paper text-ink">
      <Navbar />
      <main className="flex-grow pt-[64px]">
        {children}
      </main>
      {!bareFooter && <Footer />}
    </div>
  );
};
