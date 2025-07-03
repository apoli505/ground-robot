import React, { useState } from "react";
import { Header } from "./components/Header";
import { Login } from "./components/Login";
import { AvailabilityToggle } from "./components/AvailabilityToggle";
import { DeliveryForm } from "./components/DeliveryForm";
import { DeliveryTracking } from "./components/DeliveryTracking";
import { RobotStatus } from "./components/RobotStatus";
import { AdminPanel } from "./components/AdminPanel";
import { AuthProvider, useAuth } from "./context/AuthContext";
import {
  Notebook as Robot,
  Package,
  Zap,
  Shield,
  Clock,
  MapPin,
  Settings,
  AlertTriangle,
} from "lucide-react";

const AppContent: React.FC = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [activeView, setActiveView] = useState<"dashboard" | "admin">(
    "dashboard"
  );
  const { user, isAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <Header onLoginClick={() => setShowLogin(true)} />

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                Next-Gen Robot
              </span>
              <br />
              Package Delivery
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Experience the future of delivery with our autonomous robot fleet.
              Fast, reliable, and available 24/7 for all your package delivery
              needs.
            </p>

            {!user && (
              <button
                onClick={() => setShowLogin(true)}
                className="bg-gradient-to-r from-blue-600 to-teal-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:from-blue-700 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Get Started Today
              </button>
            )}
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Lightning Fast
              </h3>
              <p className="text-gray-600 text-sm">
                Deliveries in 30-60 minutes with our optimized robot fleet
              </p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
              <div className="w-12 h-12 bg-gradient-to-r from-green-100 to-green-200 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Secure & Safe
              </h3>
              <p className="text-gray-600 text-sm">
                Advanced security features and tamper-proof delivery containers
              </p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-purple-200 rounded-xl flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                24/7 Available
              </h3>
              <p className="text-gray-600 text-sm">
                Round-the-clock delivery service that never sleeps
              </p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-100 to-orange-200 rounded-xl flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Real-time Tracking
              </h3>
              <p className="text-gray-600 text-sm">
                Track your robot's location and delivery status in real-time
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* User Dashboard */}
      {user && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* View Toggle - Only show if user is admin */}
          {isAdmin() && (
            <div className="flex justify-center mb-8">
              <div className="bg-white rounded-full p-1 shadow-lg border border-gray-200">
                <button
                  onClick={() => setActiveView("dashboard")}
                  className={`px-6 py-2 rounded-full font-semibold transition-all ${
                    activeView === "dashboard"
                      ? "bg-gradient-to-r from-blue-600 to-teal-600 text-white shadow-md"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Package className="w-4 h-4 inline mr-2" />
                  User Dashboard
                </button>
                <button
                  onClick={() => setActiveView("admin")}
                  className={`px-6 py-2 rounded-full font-semibold transition-all ${
                    activeView === "admin"
                      ? "bg-gradient-to-r from-blue-600 to-teal-600 text-white shadow-md"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <Settings className="w-4 h-4 inline mr-2" />
                  Admin Panel
                </button>
              </div>
            </div>
          )}

          {/* Role-based content display */}
          {activeView === "dashboard" || !isAdmin() ? (
            <>
              {/* Regular user dashboard */}
              {user.role === "user" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-8">
                    <AvailabilityToggle />
                    <DeliveryForm />
                  </div>

                  {/* Right Column */}
                  <div className="space-y-8">
                    <DeliveryTracking />
                    <RobotStatus />
                  </div>
                </div>
              )}

              {/* Admin user viewing dashboard */}
              {user.role === "admin" && activeView === "dashboard" && (
                <div className="space-y-8">
                  {/* Admin notice when viewing user dashboard */}
                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Shield className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-blue-900">
                          Administrator View
                        </h3>
                        <p className="text-blue-700 text-sm">
                          You're viewing the user dashboard as an administrator.
                          Switch to Admin Panel for robot management.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div className="space-y-8">
                      <AvailabilityToggle />
                      <DeliveryForm />
                    </div>

                    {/* Right Column */}
                    <div className="space-y-8">
                      <DeliveryTracking />
                      <RobotStatus />
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Admin Panel - Only accessible by admins */}
              {isAdmin() ? (
                <AdminPanel />
              ) : (
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                  <div className="text-center">
                    <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Access Denied
                    </h3>
                    <p className="text-gray-600">
                      Administrator privileges required to access this panel.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-blue-600 to-teal-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <div className="text-blue-100">Deliveries Completed</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">25</div>
              <div className="text-blue-100">Active Robots</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">98%</div>
              <div className="text-blue-100">Customer Satisfaction</div>
            </div>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {showLogin && <Login onClose={() => setShowLogin(false)} />}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
