import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { API_BASE_URL } from "@/lib/api";

interface User {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: (googleToken: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<boolean>;
  logout: () => void;
  authenticatedFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("nexus_token"));
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize: Fetch current user if token exists
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          // Token expired or invalid
          logout();
        }
      } catch (err) {
        console.error("Failed to load user:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, [token]);

  // Login with Email/Password
  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("nexus_token", data.token);
        setToken(data.token);
        setUser(data.user);
        toast.success("Welcome back!", {
          description: `Logged in as ${data.user.name}`,
        });
        return true;
      } else {
        toast.error("Login Failed", {
          description: data.error || "Invalid credentials",
        });
        return false;
      }
    } catch (err) {
      console.error(err);
      toast.error("Error", {
        description: "An unexpected error occurred. Please try again.",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Login/Signup with Google
  const loginWithGoogle = async (googleToken: string): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: googleToken }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("nexus_token", data.token);
        setToken(data.token);
        setUser(data.user);
        toast.success("Google Login Successful", {
          description: `Welcome, ${data.user.name}`,
        });
        return true;
      } else {
        toast.error("Google Sign-In Failed", {
          description: data.error || "Could not authenticate with Google",
        });
        return false;
      }
    } catch (err) {
      console.error(err);
      toast.error("Google Sign-In Error", {
        description: "An unexpected error occurred during Google authentication.",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Register with Email/Password
  const register = async (name: string, email: string, password: string, phone?: string): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, phone }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("nexus_token", data.token);
        setToken(data.token);
        setUser(data.user);
        toast.success("Registration Successful", {
          description: `Account created for ${data.user.name}`,
        });
        return true;
      } else {
        toast.error("Registration Failed", {
          description: data.error || "Could not register account",
        });
        return false;
      }
    } catch (err) {
      console.error(err);
      toast.error("Registration Error", {
        description: "An unexpected error occurred. Please try again.",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("nexus_token");
    setToken(null);
    setUser(null);
    toast.info("Logged Out", {
      description: "You have been securely signed out.",
    });
  };

  // Authenticated fetch helper that automatically inserts headers
  const authenticatedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const headers = new Headers(options.headers || {});
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return fetch(url, { ...options, headers });
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, loginWithGoogle, register, logout, authenticatedFetch }}>
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
