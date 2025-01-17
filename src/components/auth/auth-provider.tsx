import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  signOut: async () => {},
  loading: false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleHashFragment = async () => {
      const hash = window.location.hash;

      if (hash && hash.includes("access_token")) {
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");

        if (accessToken && refreshToken) {
          const {
            data: { session },
            error,
          } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (session && !error) {
            setSession(session);
            setUser(session.user);

            // Redirect to "/create" relative to the current environment
            const redirectUrl = `${window.location.origin}/create`;
            window.location.href = redirectUrl; // Use full redirect here
          }
        }
      }
    };

    handleHashFragment();

    // Check the current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: subscription } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, session); // Debugging log
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        if (event === "SIGNED_IN") {
          navigate("/create", { replace: true }); // Use relative path for navigation
        } else if (event === "SIGNED_OUT") {
          navigate("/", { replace: true });
        }
      }
    );

    return () => subscription.subscription.unsubscribe();
  }, [navigate]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    navigate("/", { replace: true });
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
