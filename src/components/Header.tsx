import React from "react";
import {
  Notebook as Robot,
  User,
  LogOut,
  Settings,
  Shield,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface HeaderProps {
  onLoginClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onLoginClick }) => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-teal-600 rounded-full flex items-center justify-center">
              <Robot className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
              RoboDelivery
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-gray-900">
                      {user.name}
                    </p>
                    {user.role === "admin" && (
                      <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <Shield className="w-3 h-3 mr-1" />
                        Admin
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <div className="relative">
                  <button
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      user.role === "admin"
                        ? "bg-gradient-to-r from-blue-100 to-purple-100 hover:from-blue-200 hover:to-purple-200"
                        : "bg-gradient-to-r from-blue-100 to-teal-100 hover:from-blue-200 hover:to-teal-200"
                    }`}
                  >
                    {user.role === "admin" ? (
                      <Shield className="w-5 h-5 text-blue-600" />
                    ) : (
                      <User className="w-5 h-5 text-blue-600" />
                    )}
                  </button>
                </div>
                <button
                  onClick={logout}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className="bg-gradient-to-r from-blue-600 to-teal-600 text-white px-6 py-2 rounded-full font-semibold hover:from-blue-700 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
