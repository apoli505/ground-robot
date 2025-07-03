import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "../types";
import {
  createNormalUser,
  loginUser,
  quickLoginTest,
  isAdmin,
  isUser,
} from "../services/api";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    email: string,
    password: string,
    name: string,
    address?: string,
    isAdmin?: boolean
  ) => Promise<boolean>;
  logout: () => void;
  updateAvailability: (available: boolean) => void;
  updateProfile: (updates: Partial<User>) => void;
  testQuickLogin: () => Promise<boolean>;
  isAdmin: () => boolean;
  isUser: () => boolean;
  requireAdmin: () => boolean;
  requireLogin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

const DEMO_USERS = [
  {
    id: "1",
    email: "admin@example.com",
    name: "Admin User",
    isAvailable: true,
    address: "123 Admin Street, San Francisco, CA",
    role: "admin" as const,
  },
  {
    id: "2",
    email: "Ashvik.poli@gmail.com",
    name: "Ashvik Poli",
    isAvailable: true,
    address: "123 Tech Street, San Francisco, CA",
    role: "user" as const,
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      // Ensure role exists for backward compatibility
      if (!parsedUser.role) {
        parsedUser.role = "user";
      }
      setUser(parsedUser);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // First try the real robot API
      console.log("🔐 Attempting login with robot API...");
      const response = await loginUser({ email, password });

      if (response.success && response.user) {
        const apiUser: User = {
          id: response.user.id || Date.now().toString(),
          email: response.user.email,
          name: response.user.name,
          isAvailable: false, // Default to false, user can set availability
          address: response.user.address || "",
          role: response.user.role || "user",
        };

        setUser(apiUser);
        localStorage.setItem("user", JSON.stringify(apiUser));
        console.log(
          `✅ Login successful with robot API as ${apiUser.role}:`,
          apiUser
        );
        return true;
      }
    } catch (error: any) {
      console.log(
        "⚠️ Robot API login failed, trying demo credentials:",
        error.message
      );

      // Fallback to demo users if API fails (only for login, not registration)
      const foundUser = DEMO_USERS.find((u) => u.email === email);
      if (
        foundUser &&
        (password === "demo123" ||
          password === "password123" ||
          password === "admin123")
      ) {
        setUser(foundUser);
        localStorage.setItem("user", JSON.stringify(foundUser));
        console.log(
          `✅ Login successful with demo credentials as ${foundUser.role}`
        );
        return true;
      }
    }

    return false;
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    address?: string,
    isAdminRole?: boolean
  ): Promise<boolean> => {
    try {
      // Always create normal user (ignore isAdminRole parameter)
      console.log("📝 Attempting registration with robot API...");
      const response = await createNormalUser({
        email,
        password,
        name,
        address: address || "",
      });

      if (response.success) {
        // Create user object from API response
        const newUser: User = {
          id: response.user?.id || Date.now().toString(),
          email,
          name,
          isAvailable: false, // Default to false, user can set availability
          address: address || "",
          role: "user", // Always user role
        };

        setUser(newUser);
        localStorage.setItem("user", JSON.stringify(newUser));
        console.log(
          `✅ Registration successful with robot API as ${newUser.role}:`,
          newUser
        );
        return true;
      }
    } catch (error: any) {
      console.error("❌ Robot API registration failed:", error.message);
      // Don't create local fallback - throw the error to show to user
      throw error;
    }

    return false;
  };

  const testQuickLogin = async (): Promise<boolean> => {
    try {
      console.log("🧪 Testing quick login with robot API...");
      const result = await quickLoginTest();

      if (result.success && result.user) {
        const apiUser: User = {
          id: result.user.id || Date.now().toString(),
          email: result.user.email,
          name: result.user.name,
          isAvailable: false,
          address: result.user.address || "",
          role: result.user.role || "user",
        };

        setUser(apiUser);
        localStorage.setItem("user", JSON.stringify(apiUser));
        console.log(
          `✅ Quick login test successful as ${apiUser.role}:`,
          apiUser
        );
        return true;
      }
    } catch (error: any) {
      console.error("❌ Quick login test failed:", error.message);
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    console.log("👋 User logged out");
  };

  const updateAvailability = (available: boolean) => {
    if (user) {
      const updatedUser = { ...user, isAvailable: available };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      console.log("⏰ Availability updated:", available);
    }
  };

  const updateProfile = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      console.log("👤 Profile updated:", updates);
    }
  };

  const checkIsAdmin = (): boolean => {
    return user ? isAdmin(user) : false;
  };

  const checkIsUser = (): boolean => {
    return user ? isUser(user) : false;
  };

  const requireAdminAccess = (): boolean => {
    if (!user) {
      console.error("❌ Authentication required");
      return false;
    }
    if (!isAdmin(user)) {
      console.error("❌ Admin privileges required");
      return false;
    }
    return true;
  };

  const requireLoginAccess = (): boolean => {
    if (!user) {
      console.error("❌ Authentication required");
      return false;
    }
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        updateAvailability,
        updateProfile,
        testQuickLogin,
        isAdmin: checkIsAdmin,
        isUser: checkIsUser,
        requireAdmin: requireAdminAccess,
        requireLogin: requireLoginAccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
