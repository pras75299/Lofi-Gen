import { Music2 } from "lucide-react";
import { useAuth } from "../auth/auth-provider";

interface NavbarProps {
  onAuthClick?: () => void;
}

export const Navbar = ({ onAuthClick }: NavbarProps) => {
  const { user, signOut } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-md border-b border-[#997C70]/10 h-16 flex items-center">
      <div className="container mx-auto px-6 flex items-center justify-between">
        <a
          href="/"
          className="flex items-center space-x-2 text-[#8EB486] hover:text-[#997C70] transition-all duration-300"
        >
          <Music2 className="w-7 h-7" />
          <span className="text-xl font-bold tracking-tight text-[#685752]">LOFIGEN</span>
        </a>
        
        <div className="flex items-center space-x-6">
          {user ? (
            <>
              <a
                href="/create"
                className="text-sm font-medium text-[#685752] hover:text-[#8EB486] transition-colors"
              >
                Create
              </a>
              <button
                onClick={() => signOut()}
                className="px-5 py-2.5 bg-[#8EB486] hover:bg-[#997C70] text-white text-sm font-semibold rounded-full transition-all duration-300 shadow-sm hover:shadow-md"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <a
                href="#features"
                className="text-sm font-medium text-[#685752] hover:text-[#8EB486] transition-colors"
              >
                Features
              </a>
              <button
                onClick={onAuthClick}
                className="px-6 py-2.5 bg-[#8EB486] hover:bg-[#997C70] text-white text-sm font-semibold rounded-full transition-all duration-300 shadow-sm hover:shadow-md"
              >
                Get Started
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
