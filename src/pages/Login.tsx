import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Mail, Lock, Globe, ArrowRight } from "lucide-react";
import { toast } from "sonner";

declare global {
  interface Window {
    google?: any;
  }
}

export const Login: React.FC = () => {
  const { login, loginWithGoogle, logout, user } = useAuth();
  const navigate = useNavigate();
  const googleBtnRef = useRef<HTMLDivElement>(null);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Load saved credentials from localStorage
  useEffect(() => {
    const savedEmail = localStorage.getItem("nexus_saved_email");
    const savedPassword = localStorage.getItem("nexus_saved_password");
    if (savedEmail) {
      setEmail(savedEmail);
    }
    if (savedPassword) {
      setPassword(savedPassword);
    }
  }, []);

  // If already logged in, verify role and redirect to home
  useEffect(() => {
    if (user) {
      if (user.role === "Principal Investigator") {
        navigate("/");
      } else {
        toast.error("Access Denied", {
          description: "This portal is reserved for Principal Investigators.",
        });
        logout();
      }
    }
  }, [user, navigate, logout]);

  // Load Google Identity Services button
  useEffect(() => {
    const initGoogle = () => {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "MOCK_CLIENT_ID";
      
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response: any) => {
            setIsLoading(true);
            // Pass expected role when registering via Google Sign-In
            await loginWithGoogle(response.credential);
            setIsLoading(false);
          },
        });

        if (googleBtnRef.current) {
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            type: "standard",
            theme: "outline",
            size: "large",
            text: "signin_with",
            shape: "rectangular",
            logo_alignment: "left",
            width: googleBtnRef.current.clientWidth || 320,
          });
        }
      }
    };

    const timer = setTimeout(() => {
      initGoogle();
    }, 1000);

    return () => clearTimeout(timer);
  }, [loginWithGoogle]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const success = await login(email, password);
    setIsLoading(false);
    if (success) {
      // Save credentials in localStorage
      localStorage.setItem("nexus_saved_email", email);
      localStorage.setItem("nexus_saved_password", password);
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-background font-sans antialiased text-foreground">
      {/* Left Column - Beautiful Hero Info Area (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:col-span-7 bg-gradient-to-br from-primary via-primary/90 to-secondary p-12 flex-col justify-between relative overflow-hidden">
        {/* Decorative Background Shapes */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/20 rounded-full blur-3xl -mr-48 -mt-48 animate-pulse-slow"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-secondary/30 rounded-full blur-3xl -ml-24 -mb-24"></div>

        {/* Top Branding Header */}
        <div className="flex items-center gap-3 z-10">
          <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-md border border-white/20 shadow-md">
            <ShieldCheck className="h-7 w-7 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white">TrialSync</span>
            <span className="text-xs block text-white/70 font-medium tracking-wider uppercase">Clinical Nexus</span>
          </div>
        </div>

        {/* Content Block */}
        <div className="my-auto max-w-xl z-10 space-y-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/20 backdrop-blur-sm">
            <Globe className="h-3.5 w-3.5 animate-spin" style={{ animationDuration: '6s' }} /> PI Portal
          </span>
          <h1 className="text-5xl font-extrabold text-white leading-tight tracking-tight">
            Accelerate research. <br />
            <span className="text-accent">Secure patient insights.</span>
          </h1>
          <p className="text-lg text-white/80 leading-relaxed font-light">
            AI-driven patient onboarding, real-time ePRO validation, and advanced predictive analytics. Streamlining complex clinical workflows in a single secured workspace.
          </p>
        </div>

        {/* Bottom Footer Info */}
        <div className="text-xs text-white/50 z-10 flex justify-between items-center border-t border-white/10 pt-6">
          <span>&copy; {new Date().getFullYear()} Capgemini & Clinical Nexus. All rights reserved.</span>
          <a href="#" className="hover:text-white transition-colors">Security Standards</a>
        </div>
      </div>

      {/* Right Column - Beautiful Authentication Interface */}
      <div className="col-span-1 lg:col-span-5 flex flex-col justify-center items-center px-6 sm:px-12 py-12 bg-card/45 backdrop-blur-md relative">
        <div className="w-full max-w-md space-y-8 animate-slide-up">
          {/* Logo showing only on mobile */}
          <div className="flex lg:hidden items-center justify-center gap-2 mb-6">
            <ShieldCheck className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold tracking-tight gradient-text">TrialSync</span>
          </div>

          <div className="text-center lg:text-left space-y-2">
            <h2 className="text-3xl font-extrabold tracking-tight">Principal Investigator Login</h2>
            <p className="text-sm text-muted-foreground">
              Sign in to manage active clinical trials, validate data, and analyze patient response logs.
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="login-email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="login-email"
                  type="email"
                  placeholder="name@institution.org"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="login-password">Password</Label>
                <a href="#" className="text-xs text-primary hover:underline font-medium">Forgot password?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full flex gap-2" disabled={isLoading}>
              {isLoading ? "Signing In..." : "Sign In with Email"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          {/* Divider */}
          <div className="relative flex py-4 items-center">
            <div className="flex-grow border-t border-border"></div>
            <span className="flex-shrink mx-4 text-xs text-muted-foreground uppercase tracking-widest font-semibold">Or continue with</span>
            <div className="flex-grow border-t border-border"></div>
          </div>

          {/* Google Button Container */}
          <div className="flex flex-col items-center justify-center w-full min-h-[46px]">
            <div 
              ref={googleBtnRef} 
              id="googleSignInDiv"
              className="w-full flex justify-center"
            ></div>
            {(!import.meta.env.VITE_GOOGLE_CLIENT_ID || import.meta.env.VITE_GOOGLE_CLIENT_ID === "MOCK_CLIENT_ID") && (
              <p className="text-[10px] text-muted-foreground mt-2 text-center max-w-[280px]">
                Google Client ID is in fallback mode. Click above to login with mock/dev credential parser.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
