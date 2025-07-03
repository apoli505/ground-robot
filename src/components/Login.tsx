import React, { useState } from "react";
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  Notebook as Robot,
  CheckCircle,
  AlertCircle,
  MapPin,
  TestTube,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface LoginProps {
  onClose: () => void;
}

export const Login: React.FC<LoginProps> = ({ onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const { login, register, testQuickLogin } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const success = isLogin
        ? await login(email, password)
        : await register(email, password, name, address, false); // Always create normal user

      if (success) {
        onClose();
      } else {
        setError(isLogin ? "Invalid credentials" : "Registration failed");
      }
    } catch (err: any) {
      // Show the actual error message from the API
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickTest = async () => {
    setLoading(true);
    setError("");

    try {
      const success = await testQuickLogin();
      if (success) {
        onClose();
      } else {
        setError("Quick test failed - robot may be offline");
      }
    } catch (err: any) {
      setError(err.message || "Quick test failed");
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const isFormValid = () => {
    if (isLogin) {
      return validateEmail(email) && validatePassword(password);
    }
    return (
      name.trim().length >= 2 &&
      validateEmail(email) &&
      validatePassword(password)
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md my-8 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header with gradient background */}
        <div className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-teal-600 px-6 pt-6 pb-8 flex-shrink-0">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%224%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <div className="relative text-center text-white">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-3 border border-white/30">
              <Robot className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl font-bold mb-1">
              {isLogin ? "Welcome Back" : "Join RoboDelivery"}
            </h1>
            <p className="text-blue-100 text-sm">
              {isLogin
                ? "Sign in to access your robot delivery dashboard"
                : "Create your account to get started"}
            </p>
          </div>
        </div>

        {/* Scrollable form section */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-6">
            {/* Tab switcher */}
            <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(true);
                  setError("");
                }}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${
                  isLogin
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLogin(false);
                  setError("");
                }}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${
                  !isLogin
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name field for registration */}
              {!isLogin && (
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-gray-700">
                    Full Name
                  </label>
                  <div
                    className={`relative transition-all duration-200 ${
                      focusedField === "name" ? "transform scale-[1.02]" : ""
                    }`}
                  >
                    <User
                      className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors ${
                        focusedField === "name"
                          ? "text-blue-500"
                          : "text-gray-400"
                      }`}
                    />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onFocus={() => setFocusedField("name")}
                      onBlur={() => setFocusedField(null)}
                      className={`pl-10 pr-10 w-full py-3 border-2 rounded-xl transition-all duration-200 bg-gray-50 focus:bg-white focus:outline-none ${
                        focusedField === "name"
                          ? "border-blue-500 shadow-lg shadow-blue-500/20"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      placeholder="Enter your full name"
                      required
                    />
                    {name.length > 0 && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {name.trim().length >= 2 ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-amber-500" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Email field */}
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-gray-700">
                  Email Address
                </label>
                <div
                  className={`relative transition-all duration-200 ${
                    focusedField === "email" ? "transform scale-[1.02]" : ""
                  }`}
                >
                  <Mail
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors ${
                      focusedField === "email"
                        ? "text-blue-500"
                        : "text-gray-400"
                    }`}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    className={`pl-10 pr-10 w-full py-3 border-2 rounded-xl transition-all duration-200 bg-gray-50 focus:bg-white focus:outline-none ${
                      focusedField === "email"
                        ? "border-blue-500 shadow-lg shadow-blue-500/20"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    placeholder="Enter your email"
                    required
                  />
                  {email.length > 0 && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {validateEmail(email) ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-gray-700">
                  Password
                </label>
                <div
                  className={`relative transition-all duration-200 ${
                    focusedField === "password" ? "transform scale-[1.02]" : ""
                  }`}
                >
                  <Lock
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors ${
                      focusedField === "password"
                        ? "text-blue-500"
                        : "text-gray-400"
                    }`}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    className={`pl-10 pr-10 w-full py-3 border-2 rounded-xl transition-all duration-200 bg-gray-50 focus:bg-white focus:outline-none ${
                      focusedField === "password"
                        ? "border-blue-500 shadow-lg shadow-blue-500/20"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {!isLogin && password.length > 0 && (
                  <div className="text-xs text-gray-500 mt-1">
                    Password must be at least 6 characters
                  </div>
                )}
              </div>

              {/* Address field for registration */}
              {!isLogin && (
                <div className="space-y-1">
                  <label className="block text-sm font-semibold text-gray-700">
                    Address (Optional)
                  </label>
                  <div
                    className={`relative transition-all duration-200 ${
                      focusedField === "address" ? "transform scale-[1.02]" : ""
                    }`}
                  >
                    <MapPin
                      className={`absolute left-3 top-3 w-4 h-4 transition-colors ${
                        focusedField === "address"
                          ? "text-blue-500"
                          : "text-gray-400"
                      }`}
                    />
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      onFocus={() => setFocusedField("address")}
                      onBlur={() => setFocusedField(null)}
                      rows={2}
                      className={`pl-10 pr-3 w-full py-3 border-2 rounded-xl transition-all duration-200 bg-gray-50 focus:bg-white focus:outline-none resize-none ${
                        focusedField === "address"
                          ? "border-blue-500 shadow-lg shadow-blue-500/20"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      placeholder="Enter your delivery address"
                    />
                  </div>
                </div>
              )}

              {/* Error message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-red-700 text-sm font-medium">{error}</p>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading || !isFormValid()}
                className={`w-full py-3 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center space-x-2 ${
                  loading || !isFormValid()
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                }`}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                ) : (
                  <>
                    <span>{isLogin ? "Sign In" : "Create Account"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Quick test button for login */}
              {isLogin && (
                <button
                  type="button"
                  onClick={handleQuickTest}
                  disabled={loading}
                  className="w-full py-2.5 rounded-xl font-semibold text-blue-600 bg-blue-50 border-2 border-blue-200 hover:bg-blue-100 hover:border-blue-300 transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <TestTube className="w-4 h-4" />
                  <span>Quick Test Login</span>
                </button>
              )}
            </form>

            {/* Registration info */}
            {!isLogin && (
              <div className="mt-4 space-y-3">
                <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-green-900 mb-1">
                        Real Robot Integration
                      </h4>
                      <p className="text-xs text-green-700">
                        All new accounts are created as regular users for
                        package delivery services.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-gray-900">
                    User Features:
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="flex items-center space-x-2 mb-1">
                      <User className="w-3 h-3 text-green-500" />
                      <span className="text-sm font-semibold text-gray-900">
                        Regular User
                      </span>
                    </div>
                    <ul className="text-xs text-gray-600 space-y-0.5">
                      {[
                        "Request deliveries",
                        "Track packages",
                        "Set availability",
                        "Real-time notifications",
                      ].map((feature, idx) => (
                        <li key={idx} className="flex items-center space-x-1">
                          <CheckCircle className="w-2.5 h-2.5 text-green-500 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
