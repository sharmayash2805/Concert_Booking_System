import React, { createContext, useContext, useState, useEffect } from "react";
import { AppUser, DEMO_USERS } from "@/data/mockData";
import API from "@/api/api";
import { toast } from "sonner";

interface AuthContextType {
  user: AppUser;
  role: "USER" | "ADMIN";
  isAdmin: boolean;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, password: string, role?: "USER" | "ADMIN") => Promise<{ success: boolean; message?: string }>;
  loginAsDemo: (targetRole: "USER" | "ADMIN") => void;
  logout: () => void;
  switchRole: (newRole?: "USER" | "ADMIN") => void;
}

const AUTH_STORAGE_KEY = "concerthub_auth_user";
const REGISTERED_USERS_KEY = "concerthub_registered_users";

const defaultUser: AppUser = DEMO_USERS[0]; // Sarah Connor (USER)

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (_err) {
          // ignore corrupted JSON and use default
        }
      }
    }
    return defaultUser;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    }
  }, [user]);

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    const trimmedEmail = email.trim().toLowerCase();

    // 1. Try real backend first if available
    try {
      const response = await API.post("/auth/login", { email: trimmedEmail, password });
      if (response.data) {
        // Backend returned token or user
        const token = typeof response.data === "string" ? response.data : response.data.token;
        if (token) localStorage.setItem("token", token);

        const isAdminEmail = trimmedEmail.includes("admin");
        const authenticatedUser: AppUser = {
          id: response.data.userId || Date.now(),
          name: response.data.name || (isAdminEmail ? "Admin Manager" : "Concert Fan"),
          email: trimmedEmail,
          role: isAdminEmail ? "ADMIN" : "USER",
        };
        setUser(authenticatedUser);
        return { success: true };
      }
    } catch (_err) {
      // Backend not reached or returned error, check local user records
    }

    // 2. Local check: Demo accounts
    const matchedDemo = DEMO_USERS.find((u) => u.email.toLowerCase() === trimmedEmail);
    if (matchedDemo) {
      // password check for demo users
      const expectedPw = matchedDemo.role === "ADMIN" ? "admin123" : "user123";
      if (password && password !== expectedPw) {
        return { success: false, message: `Incorrect password. For demo, use "${expectedPw}".` };
      }
      setUser(matchedDemo);
      localStorage.setItem("token", `mock-token-${matchedDemo.role.toLowerCase()}-${Date.now()}`);
      return { success: true };
    }

    // 3. Registered users in localStorage
    const savedUsers: Array<AppUser & { password?: string }> = JSON.parse(
      localStorage.getItem(REGISTERED_USERS_KEY) || "[]"
    );
    const existing = savedUsers.find((u) => u.email.toLowerCase() === trimmedEmail);
    if (existing) {
      if (existing.password && existing.password !== password) {
        return { success: false, message: "Invalid password." };
      }
      const loggedIn: AppUser = {
        id: existing.id,
        name: existing.name,
        email: existing.email,
        role: existing.role || "USER",
      };
      setUser(loggedIn);
      localStorage.setItem("token", `mock-token-${loggedIn.role.toLowerCase()}-${Date.now()}`);
      return { success: true };
    }

    // If no existing account found, allow seamless instant demo login
    return {
      success: false,
      message: "No account found with this email. Try 'user@concerthub.com' or click a Demo Login button.",
    };
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: "USER" | "ADMIN" = "USER"
  ): Promise<{ success: boolean; message?: string }> => {
    const trimmedEmail = email.trim().toLowerCase();

    // 1. Backend attempt
    try {
      await API.post("/auth/register", { name, email: trimmedEmail, password, role });
    } catch (_err) {
      // Fallback to local storage registration
    }

    // 2. Save locally
    const savedUsers: Array<AppUser & { password?: string }> = JSON.parse(
      localStorage.getItem(REGISTERED_USERS_KEY) || "[]"
    );

    const newUser: AppUser & { password?: string } = {
      id: Date.now(),
      name,
      email: trimmedEmail,
      role,
      password,
    };

    savedUsers.push(newUser);
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(savedUsers));

    // Log the user in
    const activeUser: AppUser = { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role };
    setUser(activeUser);
    localStorage.setItem("token", `mock-token-${role.toLowerCase()}-${Date.now()}`);

    return { success: true };
  };

  const loginAsDemo = (targetRole: "USER" | "ADMIN") => {
    const demo = DEMO_USERS.find((u) => u.role === targetRole) || DEMO_USERS[0];
    setUser(demo);
    localStorage.setItem("token", `demo-token-${targetRole.toLowerCase()}`);
    toast.success(`Logged in as ${targetRole === "ADMIN" ? "Admin" : "User"}: ${demo.name}`);
  };

  const switchRole = (targetRole?: "USER" | "ADMIN") => {
    const newRole = targetRole || (user.role === "ADMIN" ? "USER" : "ADMIN");
    const demo = DEMO_USERS.find((u) => u.role === newRole) || {
      ...user,
      role: newRole,
    };
    setUser(demo);
    toast.info(`Switched to ${newRole === "ADMIN" ? "Admin Mode 🛡️" : "User Mode 👤"}`);
  };

  const logout = () => {
    // Reset to default demo user or prompt login
    setUser(DEMO_USERS[0]);
    localStorage.removeItem("token");
    toast.success("Signed out. Switched to guest mode.");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user.role,
        isAdmin: user.role === "ADMIN",
        isLoggedIn: !!user,
        login,
        register,
        loginAsDemo,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
