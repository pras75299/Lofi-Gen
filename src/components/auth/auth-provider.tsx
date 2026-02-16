import { createContext, useContext, ReactNode } from "react";
import { authClient } from "@/lib/auth-client";

interface AuthContextType {
  user: any;
  session: any;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  signOut: async () => {},
  loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { data: session, isPending: loading } = authClient.useSession();

  const signOut = async () => {
    await authClient.signOut();
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider
      value={{
        user: session?.user ?? null,
        session: session ?? null,
        loading,
        signOut,
      }}
    >
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
