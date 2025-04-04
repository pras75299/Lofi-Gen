import React from "react";
import { MeteorPreview } from "./components/ui/meteor-preview";
import { MovingBorder } from "./components/ui/moving-border";
import { TestimonialCard } from "./components/testimonial-card";
import { FeatureCard } from "./components/feature-card";
import { InfiniteMovingCards } from "./components/ui/infinite-moving-cards";
import { Upload, Music, Sliders, ArrowRight, Music2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { AuthForm } from "./components/auth/auth-form";
import { useAuth } from "./components/auth/auth-provider";

function App() {
  const { user, signOut } = useAuth();
  const [showAuthForm, setShowAuthForm] = React.useState(false);

  const features = [
    {
      icon: Upload,
      title: "Seamless Uploads",
      description:
        "Drag and drop your tracks or browse your files. Support for all major audio formats.",
    },
    {
      icon: Music,
      title: "Real-Time Lo-Fi Effects",
      description:
        "Apply vinyl crackle, tape hiss, and other authentic Lo-Fi effects in real-time.",
    },
    {
      icon: Sliders,
      title: "Customizable Sound Settings",
      description:
        "Fine-tune every aspect of your Lo-Fi sound with intuitive controls.",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      title: "Music Producer",
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
      quote:
        "This tool has completely transformed my production workflow. The Lo-Fi effects are incredibly authentic!",
    },
    {
      name: "Marcus Rodriguez",
      title: "Bedroom Producer",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
      quote:
        "Finally found the perfect way to give my tracks that cozy Lo-Fi feeling. Absolutely love it!",
    },
    {
      name: "Emily Taylor",
      title: "Content Creator",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
      quote:
        "The ease of use and quality of the output is incredible. My YouTube videos sound so much better now.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FDF7F4] text-[#685752]">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FDF7F4]/80 backdrop-blur-sm border-b border-[#997C70]/20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <a
              href="/"
              className="flex items-center space-x-2 text-[#8EB486] hover:text-[#997C70] transition-colors"
            >
              <Music2 className="w-6 h-6" />
              <span className="text-xl font-bold">LOFIGEN</span>
            </a>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <a
                    href="/create"
                    className="px-4 py-2 text-[#685752] hover:text-[#8EB486] transition-colors"
                  >
                    Create
                  </a>
                  <button
                    onClick={() => signOut()}
                    className="px-4 py-2 bg-[#8EB486] hover:bg-[#997C70] text-white font-medium rounded-md transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setShowAuthForm(true)}
                    className="px-4 py-2 text-[#685752] hover:text-[#8EB486] transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      setShowAuthForm(true);
                    }}
                    className="px-4 py-2 bg-[#8EB486] hover:bg-[#997C70] text-white font-medium rounded-md transition-colors shadow-lg"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Updated Background and Text Colors */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 bg-[#4A6C2B]">
        <MeteorPreview />
        <div className="relative z-10 container mx-auto px-4 py-32 text-center">
          <motion.h1
            className="text-5xl md:text-7xl font-bold mb-6 text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Transform Your Music into Lo-Fi Masterpieces
          </motion.h1>
          <motion.p
            className="text-xl text-gray-200 mb-12 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Transform your music with the perfect Lo-Fi vibe instantly.
          </motion.p>
          {!user && (
            <div className="inline-block">
              <button
                onClick={() => setShowAuthForm(true)}
                className="relative px-8 py-4 bg-white/90 hover:bg-white text-[#4A6C2B] font-medium rounded-md transition-colors group shadow-lg"
              >
                Get Started
                <ArrowRight className="inline-block ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Features Section - Updated Background and Title Color */}
      <div className="py-24 bg-[#FDF7F4]" id="features">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-[#685752]">
            Core Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-8">
            What Our Users Say
          </h2>
          <InfiniteMovingCards
            items={[
              ...testimonials,
              {
                name: "Alex Kim",
                title: "Music Student",
                image:
                  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop",
                quote:
                  "The Lo-Fi effects are so authentic, it's exactly what I needed for my study music playlist.",
              },
              {
                name: "Jordan Lee",
                title: "Indie Artist",
                image:
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop",
                quote:
                  "This tool has become an essential part of my production process. The results are amazing!",
              },
            ]}
            speed="slow"
            className="py-8"
          />
        </div>
      </div>

      {/* CTA Section - Added Sign Up Button */}
      <div className="py-24 bg-[#997C70]" id="cta">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6 text-white">
            Join the Lo-Fi Revolution
          </h2>
          <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto">
            {user
              ? "Ready to create more Lo-Fi masterpieces?"
              : "Start creating your own Lo-Fi masterpieces today. Sign up now and get instant access to all features!"}
          </p>
          {!user && (
            <button
              onClick={() => setShowAuthForm(true)}
              className="px-8 py-3 bg-[#FDF7F4] hover:bg-white text-[#997C70] font-semibold rounded-md transition-colors shadow-lg"
            >
              Sign Up
            </button>
          )}
        </div>
      </div>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <button
                onClick={() => setShowAuthForm(false)}
                className="absolute -top-4 -right-4 w-8 h-8 bg-[#997C70] text-white rounded-full flex items-center justify-center hover:bg-[#685752] transition-colors"
              >
                ×
              </button>
              <AuthForm />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer - Updated Columns */}
      <footer className="py-12 border-t border-[#997C70]/20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Text Generator</h3>
              <p className="text-[#997C70]">
                Simply voliuer, your audio do and twir creating.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-[#997C70]">
                <li>
                  <a
                    href="#features"
                    className="hover:text-[#8EB486] transition-colors"
                  >
                    Features
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-[#997C70]">
                <li>
                  <a
                    href="#"
                    className="hover:text-[#8EB486] transition-colors"
                  >
                    Blog
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-[#997C70]">
                <li>
                  <a
                    href="mailto:support@example.com"
                    className="hover:text-[#8EB486] transition-colors"
                  >
                    Email
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-[#997C70]/20 text-center text-[#997C70]">
            <p>
              &copy; {new Date().getFullYear()} Lo-Fi Generator. All rights
              reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
