import { Music2 } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="py-16 border-t border-[#997C70]/10 bg-white/30 backdrop-blur-sm">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-[#8EB486]">
              <Music2 className="w-6 h-6" />
              <span className="text-lg font-bold">LOFIGEN</span>
            </div>
            <p className="text-sm text-[#997C70] leading-relaxed">
              Transform your audio into Lo-Fi masterpieces with authentic effects and customizable settings.
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-bold text-[#685752] uppercase tracking-wider mb-6">Product</h4>
            <ul className="space-y-3 text-sm text-[#997C70]">
              <li><a href="#features" className="hover:text-[#8EB486] transition-colors">Features</a></li>
              <li><a href="/create" className="hover:text-[#8EB486] transition-colors">Create</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-bold text-[#685752] uppercase tracking-wider mb-6">Resources</h4>
            <ul className="space-y-3 text-sm text-[#997C70]">
              <li><a href="#" className="hover:text-[#8EB486] transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-[#8EB486] transition-colors">Presets Guide</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-bold text-[#685752] uppercase tracking-wider mb-6">Connect</h4>
            <ul className="space-y-3 text-sm text-[#997C70]">
              <li><a href="mailto:support@example.com" className="hover:text-[#8EB486] transition-colors">Email Support</a></li>
              <li><a href="#" className="hover:text-[#8EB486] transition-colors">Twitter</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-[#997C70]/5 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-sm text-[#997C70]">
          <p>&copy; {new Date().getFullYear()} LOFIGEN. All rights reserved.</p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-[#8EB486] transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-[#8EB486] transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
