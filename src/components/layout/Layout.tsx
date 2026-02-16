import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

interface LayoutProps {
  children: React.ReactNode;
  onAuthClick?: () => void;
}

export const Layout = ({ children, onAuthClick }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#FDF7F4]">
      <Navbar onAuthClick={onAuthClick} />
      <main className="flex-grow pt-16">
        {children}
      </main>
      <Footer />
    </div>
  );
};

