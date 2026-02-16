import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Loader2, AlertCircle, Github } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const AuthForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const navigate = useNavigate();

  const handleSocialLogin = async (provider: "github" | "google") => {
    setLoading(true);
    setError(null);

    try {
      await authClient.signIn.social({
        provider,
        callbackURL: "/create",
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to connect with social provider"
      );
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = (password: string) => {
    if (password.length < 6) {
      return "Password must be at least 6 characters long";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setValidationError(null);

    const passwordError = validatePassword(password);
    if (passwordError) {
      setValidationError(passwordError);
      setLoading(false);
      return;
    }

    try {
      if (mode === "signup") {
        const { error: signUpError } = await authClient.signUp.email({
          email,
          password,
          name: email.split("@")[0],
          callbackURL: "/create",
        });
        if (signUpError) throw new Error(signUpError.message || "Failed to sign up");
        setError("Check your email to confirm your account");
      } else {
        const { error: signInError } = await authClient.signIn.email({
          email,
          password,
          callbackURL: "/create",
        });
        if (signInError) throw new Error(signInError.message || "Invalid email or password");
        navigate("/create");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-[#FDF7F4] p-8 rounded-xl shadow-2xl border border-[#997C70]/20">
      <h2 className="text-2xl font-bold text-[#685752] mb-2 text-center">
        {mode === "signin" ? "Sign In" : "Create Account"}
      </h2>
      <p className="text-sm text-[#997C70] text-center mb-8">
        Create amazing Lo-Fi tracks with our tools
      </p>

      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500 rounded text-red-500 text-sm">
          <div className="flex items-center gap-2 text-red-500">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        </div>
      )}

      {validationError && (
        <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500 rounded text-sm">
          <div className="flex items-center gap-2 text-yellow-500">
            <AlertCircle className="h-4 w-4" />
            {validationError}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <button
          disabled={loading}
          onClick={() => handleSocialLogin("github")}
          className="w-full px-4 py-3 bg-[#171515] text-white font-medium rounded-lg transition-all hover:bg-[#2b2b2b] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transform hover:translate-y-[-1px]"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Github className="w-5 h-5" />
          )}
          Sign in with GitHub
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#997C70]/20"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-[#FDF7F4] text-[#997C70]">
              Or use email
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 mt-6">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-[#685752] mb-1"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-[#8EB486]/30 rounded-lg text-[#685752] placeholder-[#997C70] focus:outline-none focus:ring-2 focus:ring-[#8EB486] focus:border-transparent transition-all"
            placeholder="Enter your email"
            required
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-[#685752] mb-1"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            className="w-full px-4 py-2.5 bg-white border border-[#8EB486]/30 rounded-lg text-[#685752] placeholder-[#997C70] focus:outline-none focus:ring-2 focus:ring-[#8EB486] focus:border-transparent transition-all"
            placeholder="Enter your password (min. 6 characters)"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-3 bg-[#8EB486] hover:bg-[#997C70] text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg transform hover:translate-y-[-1px]"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : mode === "signin" ? (
            "Sign In"
          ) : (
            "Create Account"
          )}
        </button>
      </form>

      <p className="mt-6 text-sm text-[#997C70] text-center">
        {mode === "signin" ? (
          <>
            Don't have an account?{" "}
            <button
              onClick={() => setMode("signup")}
              className="text-[#8EB486] hover:text-[#997C70] font-medium transition-colors"
            >
              Sign up
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button
              onClick={() => setMode("signin")}
              className="text-[#8EB486] hover:text-[#997C70] font-medium"
            >
              Sign in
            </button>
          </>
        )}
      </p>
    </div>
  );
};
