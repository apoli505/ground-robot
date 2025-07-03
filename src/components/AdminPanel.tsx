import React, { useState, useEffect } from "react";
import {
  Settings,
  Package,
  Users,
  Activity,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MapPin,
  Monitor,
  Wifi,
  HardDrive,
  Cpu,
  Battery,
  Truck,
  Lock,
  Unlock,
  Clock,
  User,
  Shield,
  RotateCcw,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
  getBoxStatus,
  getSystemStatus,
  getAllUsers,
  loadPackage,
  unloadPackage,
  generatePackageId,
  packageLoadingWorkflow,
  testConnection,
  boxControlAPI,
  boxControlWorkflow,
} from "../services/api";
import { RobotLocationTracker } from "./RobotLocationTracker";

// LoadRobotPage Component (embedded within AdminPanel)
const LoadRobotPage: React.FC = () => {
  const { user } = useAuth();
  const [boxStatus, setBoxStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [autoLockTimer, setAutoLockTimer] = useState<number | null>(null);
  const [lastOperation, setLastOperation] = useState<any>(null);

  // Auto-refresh box status
  useEffect(() => {
    loadBoxStatus();
    const interval = setInterval(loadBoxStatus, 2000); // Refresh every 2 seconds
    return () => clearInterval(interval);
  }, []);

  // Auto-lock countdown
  useEffect(() => {
    if (autoLockTimer && autoLockTimer > 0) {
      const countdown = setInterval(() => {
        setAutoLockTimer((prev) => (prev ? prev - 1 : null));
      }, 1000);
      return () => clearInterval(countdown);
    }
  }, [autoLockTimer]);

  const loadBoxStatus = async () => {
    try {
      const data = await boxControlWorkflow.getStatus();
      setBoxStatus(data);
    } catch (err: any) {
      console.error("Failed to load box status:", err);
    }
  };

  const handleOpenAllBoxes = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await boxControlWorkflow.openForLoading(
        user?.name || "Admin",
        300, // 5 minutes auto-lock
        "Loading packages via admin panel"
      );

      if (result.success) {
        setSuccess(
          `All ${result.opened_boxes.length} boxes opened successfully!`
        );
        setAutoLockTimer(300); // Start 5-minute countdown
        setLastOperation({
          type: "open_all",
          time: new Date(),
          operator: user?.name || "Admin",
        });
        await loadBoxStatus();
      } else {
        setError(result.message || "Failed to open boxes");
      }
    } catch (err: any) {
      setError(err.message || "Failed to open boxes");
    } finally {
      setLoading(false);
    }
  };

  const handleLockAllBoxes = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await boxControlWorkflow.secureAfterLoading(
        user?.name || "Admin",
        "Securing all boxes via admin panel"
      );

      if (result.success) {
        setSuccess(`All boxes locked successfully!`);
        setAutoLockTimer(null); // Clear countdown
        setLastOperation({
          type: "lock_all",
          time: new Date(),
          operator: user?.name || "Admin",
        });
        await loadBoxStatus();
      } else {
        setError(result.message || "Failed to lock boxes");
      }
    } catch (err: any) {
      setError(err.message || "Failed to lock boxes");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBox = async (boxNumber: number) => {
    setLoading(true);
    setError(null);

    try {
      const result = await boxControlWorkflow.manageBox(
        boxNumber,
        "toggle",
        user?.name || "Admin"
      );

      if (result.success) {
        setSuccess(`Box ${boxNumber} ${result.new_state} successfully!`);
        setLastOperation({
          type: "toggle",
          box: boxNumber,
          new_state: result.new_state,
          time: new Date(),
          operator: user?.name || "Admin",
        });
        await loadBoxStatus();
      } else {
        setError(result.message || `Failed to toggle Box ${boxNumber}`);
      }
    } catch (err: any) {
      setError(err.message || `Failed to toggle Box ${boxNumber}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEmergencyLock = async () => {
    if (
      !confirm(
        "Are you sure you want to emergency lock ALL boxes? This will immediately secure all compartments."
      )
    ) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await boxControlWorkflow.emergencySecure(
        user?.name || "Admin"
      );

      if (result.success) {
        setSuccess("🚨 EMERGENCY LOCK ACTIVATED - All boxes secured!");
        setAutoLockTimer(null);
        setLastOperation({
          type: "emergency_lock",
          time: new Date(),
          operator: user?.name || "Admin",
        });
        await loadBoxStatus();
      } else {
        setError(result.message || "Emergency lock failed");
      }
    } catch (err: any) {
      setError(err.message || "Emergency lock failed");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-100 to-red-100 rounded-full flex items-center justify-center">
              <Package className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Load Robot</h2>
              <p className="text-gray-600">
                Open compartments to load packages
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {autoLockTimer && (
              <div className="flex items-center space-x-2 bg-orange-100 text-orange-700 px-3 py-2 rounded-lg">
                <Clock className="w-4 h-4" />
                <span className="font-mono">{formatTime(autoLockTimer)}</span>
              </div>
            )}

            <button
              onClick={loadBoxStatus}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <XCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <p className="text-green-700 font-medium">{success}</p>
          </div>
        </div>
      )}

      {/* Main Control Panel */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Box Control Panel
        </h3>

        {/* Global Controls */}
        <div className="mb-8">
          <h4 className="text-md font-semibold text-gray-700 mb-4">
            Global Controls
          </h4>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleOpenAllBoxes}
              disabled={loading}
              className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-teal-700 transition-all duration-200 disabled:opacity-50"
            >
              <Unlock className="w-5 h-5" />
              <span>Open All Boxes</span>
            </button>

            <button
              onClick={handleLockAllBoxes}
              disabled={loading}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50"
            >
              <Lock className="w-5 h-5" />
              <span>Lock All Boxes</span>
            </button>

            <button
              onClick={handleEmergencyLock}
              disabled={loading}
              className="flex items-center space-x-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-200 disabled:opacity-50"
            >
              <Shield className="w-5 h-5" />
              <span>Emergency Lock</span>
            </button>
          </div>
        </div>

        {/* Individual Box Controls */}
        <div>
          <h4 className="text-md font-semibold text-gray-700 mb-4">
            Individual Box Controls
          </h4>

          {boxStatus ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(boxStatus.boxes).map(
                ([boxNum, box]: [string, any]) => (
                  <div
                    key={boxNum}
                    className={`border-2 rounded-lg p-4 transition-all duration-200 ${
                      box.unlocked
                        ? "border-green-200 bg-green-50"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <div className="text-center mb-4">
                      <div className="text-lg font-bold text-gray-900 mb-1">
                        Box {boxNum}
                      </div>

                      <div className="flex items-center justify-center space-x-2 mb-2">
                        {box.unlocked ? (
                          <Unlock className="w-4 h-4 text-green-600" />
                        ) : (
                          <Lock className="w-4 h-4 text-gray-600" />
                        )}
                        <span
                          className={`text-sm font-medium ${
                            box.unlocked ? "text-green-700" : "text-gray-700"
                          }`}
                        >
                          {box.unlocked ? "Unlocked" : "Locked"}
                        </span>
                      </div>

                      {box.occupied && (
                        <div className="bg-orange-100 rounded-lg p-2 mb-3">
                          <div className="text-xs text-orange-800 font-medium">
                            Package: {box.package_id}
                          </div>
                          <div className="text-xs text-orange-600">
                            {box.user_name}
                          </div>
                        </div>
                      )}

                      {!box.occupied && (
                        <div className="text-xs text-gray-500 mb-3">
                          Available for loading
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleToggleBox(parseInt(boxNum))}
                      disabled={loading}
                      className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                        box.unlocked
                          ? "bg-red-100 text-red-700 hover:bg-red-200"
                          : "bg-green-100 text-green-700 hover:bg-green-200"
                      }`}
                    >
                      {box.unlocked ? (
                        <>
                          <Lock className="w-4 h-4" />
                          <span>Lock</span>
                        </>
                      ) : (
                        <>
                          <Unlock className="w-4 h-4" />
                          <span>Open</span>
                        </>
                      )}
                    </button>
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Loading box status...
            </div>
          )}
        </div>
      </div>

      {/* Safety Information */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
          <div className="text-amber-800">
            <h4 className="font-semibold mb-1">Safety Information</h4>
            <ul className="text-sm space-y-1">
              <li>
                • Boxes will auto-lock after 5 minutes when opened via "Open
                All"
              </li>
              <li>• Always secure boxes after loading packages</li>
              <li>• Use Emergency Lock if immediate security is needed</li>
              <li>• Box status updates automatically every 2 seconds</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Last Operation Info */}
      {lastOperation && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5 text-blue-600" />
            <div className="text-blue-800">
              <span className="font-semibold">Last Operation:</span>
              <span className="ml-2">
                {lastOperation.type === "open_all" && "Opened all boxes"}
                {lastOperation.type === "lock_all" && "Locked all boxes"}
                {lastOperation.type === "toggle" &&
                  `Toggled Box ${lastOperation.box} to ${lastOperation.new_state}`}
                {lastOperation.type === "emergency_lock" &&
                  "Emergency lock activated"}
              </span>
              <span className="ml-2 text-sm">
                by {lastOperation.operator} at{" "}
                {lastOperation.time.toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main AdminPanel Component
export const AdminPanel: React.FC = () => {
  const { user, requireAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "overview" | "packages" | "users" | "load-robot" | "tracking" | "system"
  >("overview");
  const [boxStatus, setBoxStatus] = useState<any>(null);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [connectionTest, setConnectionTest] = useState<any>(null);

  // Package loading state
  const [packageForm, setPackageForm] = useState({
    package_id: "",
    selectedUser: null as any,
    box_number: 1,
    mode: "existing" as "existing" | "manual",
    user_name: "",
    user_email: "",
    user_address: "",
  });

  // Check admin access
  useEffect(() => {
    if (!requireAdmin()) {
      return;
    }
  }, [user, requireAdmin]);

  // Load initial data
  useEffect(() => {
    if (user && user.role === "admin") {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [boxData, systemData, usersData] = await Promise.all([
        getBoxStatus(),
        getSystemStatus(),
        getAllUsers(),
      ]);

      setBoxStatus(boxData);
      setSystemStatus(systemData);
      setUsers(usersData.users || []);
    } catch (err: any) {
      setError(err.message);
      console.error("Failed to load admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectionTest = async () => {
    setLoading(true);
    try {
      const result = await testConnection();
      setConnectionTest(result);
      if (result.success) {
        setSuccess("Connection test successful!");
      } else {
        setError(`Connection failed: ${result.error}`);
      }
    } catch (err: any) {
      setError(err.message);
      setConnectionTest({ success: false, error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleLoadPackage = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await packageLoadingWorkflow.load(
        packageForm,
        packageForm.mode
      );

      if (result.success) {
        setSuccess(result.message);
        setPackageForm({
          ...packageForm,
          package_id: generatePackageId(),
          selectedUser: null,
          user_name: "",
          user_email: "",
          user_address: "",
        });
        await loadData(); // Refresh data
      } else {
        setError(result.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUnloadPackage = async (boxNumber: number) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await unloadPackage(boxNumber, "Admin unload", user?.name || "Admin");
      setSuccess(`Package unloaded from Box ${boxNumber}`);
      await loadData(); // Refresh data
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Generate new package ID when component mounts
  useEffect(() => {
    setPackageForm((prev) => ({
      ...prev,
      package_id: generatePackageId(),
    }));
  }, []);

  if (!user || user.role !== "admin") {
    return (
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
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: Activity },
    { id: "packages", label: "Package Management", icon: Package },
    { id: "users", label: "User Management", icon: Users },
    { id: "load-robot", label: "Load Robot", icon: Truck },
    { id: "tracking", label: "Robot Tracking", icon: MapPin },
    /* { id: "system", label: "System Status", icon: Monitor },*/
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
              <Settings className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Admin Panel</h2>
              <p className="text-gray-600">Robot delivery system management</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleConnectionTest}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
            >
              <Wifi className="w-4 h-4" />
              <span>Test Connection</span>
            </button>

            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <XCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <p className="text-green-700 font-medium">{success}</p>
          </div>
        </div>
      )}

      {/* Connection Test Results */}
      {connectionTest && (
        <div
          className={`border rounded-lg p-4 ${
            connectionTest.success
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          }`}
        >
          <div className="flex items-center space-x-2 mb-2">
            {connectionTest.success ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
            <h4
              className={`font-semibold ${
                connectionTest.success ? "text-green-900" : "text-red-900"
              }`}
            >
              Connection Test {connectionTest.success ? "Passed" : "Failed"}
            </h4>
          </div>

          {connectionTest.success ? (
            <div className="text-sm text-green-700 space-y-1">
              <p>✅ Health check: OK</p>
              <p>✅ System status: Connected</p>
              <p>✅ Box status: Accessible</p>
              <p>✅ Box control: Functional</p>
            </div>
          ) : (
            <div className="text-sm text-red-700">
              <p>❌ {connectionTest.error}</p>
              {connectionTest.suggestion && (
                <p className="mt-1 font-medium">
                  💡 {connectionTest.suggestion}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">
                System Overview
              </h3>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Package className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">
                      Total Boxes
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-blue-900 mt-1">
                    {boxStatus ? Object.keys(boxStatus.boxes).length : "0"}
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-900">
                      Available
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-green-900 mt-1">
                    {boxStatus
                      ? Object.values(boxStatus.boxes).filter(
                          (box: any) => !box.occupied
                        ).length
                      : "0"}
                  </div>
                </div>

                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Package className="w-5 h-5 text-orange-600" />
                    <span className="text-sm font-medium text-orange-900">
                      Occupied
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-orange-900 mt-1">
                    {boxStatus
                      ? Object.values(boxStatus.boxes).filter(
                          (box: any) => box.occupied
                        ).length
                      : "0"}
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium text-purple-900">
                      Users
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-purple-900 mt-1">
                    {users.length}
                  </div>
                </div>
              </div>

              {/* Box Status Grid */}
              {boxStatus && (
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3">
                    Box Status
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(boxStatus.boxes).map(
                      ([boxNum, box]: [string, any]) => (
                        <div
                          key={boxNum}
                          className={`border-2 rounded-lg p-4 ${
                            box.occupied
                              ? "border-red-200 bg-red-50"
                              : box.unlocked
                              ? "border-yellow-200 bg-yellow-50"
                              : "border-green-200 bg-green-50"
                          }`}
                        >
                          <div className="text-center">
                            <div className="text-lg font-bold text-gray-900">
                              Box {boxNum}
                            </div>
                            <div className="flex items-center justify-center space-x-1 mb-1">
                              {box.unlocked ? (
                                <Unlock className="w-4 h-4 text-yellow-600" />
                              ) : (
                                <Lock className="w-4 h-4 text-gray-600" />
                              )}
                              <span
                                className={`text-sm font-medium ${
                                  box.occupied
                                    ? "text-red-700"
                                    : box.unlocked
                                    ? "text-yellow-700"
                                    : "text-green-700"
                                }`}
                              >
                                {box.occupied
                                  ? "Occupied"
                                  : box.unlocked
                                  ? "Unlocked"
                                  : "Available"}
                              </span>
                            </div>
                            {box.occupied && box.package_id && (
                              <div className="mt-2 text-xs text-gray-600">
                                <div>ID: {box.package_id}</div>
                                <div>User: {box.user_name}</div>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Package Management Tab */}
          {activeTab === "packages" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Package Management
              </h3>

              {/* Package Loading Form */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-md font-semibold text-gray-900 mb-4">
                  Load New Package
                </h4>

                {/* Mode Selection */}
                <div className="mb-4">
                  <div className="flex space-x-4">
                    <button
                      onClick={() =>
                        setPackageForm({ ...packageForm, mode: "existing" })
                      }
                      className={`px-4 py-2 rounded-lg font-medium ${
                        packageForm.mode === "existing"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      Existing User
                    </button>
                    <button
                      onClick={() =>
                        setPackageForm({ ...packageForm, mode: "manual" })
                      }
                      className={`px-4 py-2 rounded-lg font-medium ${
                        packageForm.mode === "manual"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      Manual Entry
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Package ID */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tracking ID
                    </label>
                    <input
                      type="text"
                      value={packageForm.package_id}
                      onChange={(e) =>
                        setPackageForm({
                          ...packageForm,
                          package_id: e.target.value,
                        })
                      }
                      className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter Tracking ID"
                    />
                  </div>

                  {/* Box Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Box Number
                    </label>
                    <select
                      value={packageForm.box_number}
                      onChange={(e) =>
                        setPackageForm({
                          ...packageForm,
                          box_number: parseInt(e.target.value),
                        })
                      }
                      className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {[1, 2, 3, 4].map((num) => (
                        <option key={num} value={num}>
                          Box {num}{" "}
                          {boxStatus?.boxes[num]?.occupied
                            ? "(Occupied)"
                            : boxStatus?.boxes[num]?.unlocked
                            ? "(Unlocked)"
                            : "(Available)"}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* User Selection or Manual Entry */}
                  {packageForm.mode === "existing" ? (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select User
                      </label>
                      <select
                        value={packageForm.selectedUser?.email || ""}
                        onChange={(e) => {
                          const user = users.find(
                            (u) => u.email === e.target.value
                          );
                          setPackageForm({
                            ...packageForm,
                            selectedUser: user,
                          });
                        }}
                        className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select a user...</option>
                        {users
                          .filter((u) => u.role !== "admin")
                          .map((user) => (
                            <option key={user.email} value={user.email}>
                              {user.name} ({user.email})
                            </option>
                          ))}
                      </select>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Customer Name
                        </label>
                        <input
                          type="text"
                          value={packageForm.user_name}
                          onChange={(e) =>
                            setPackageForm({
                              ...packageForm,
                              user_name: e.target.value,
                            })
                          }
                          className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter customer name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Customer Email
                        </label>
                        <input
                          type="email"
                          value={packageForm.user_email}
                          onChange={(e) =>
                            setPackageForm({
                              ...packageForm,
                              user_email: e.target.value,
                            })
                          }
                          className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter customer email"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Delivery Address
                        </label>
                        <textarea
                          value={packageForm.user_address}
                          onChange={(e) =>
                            setPackageForm({
                              ...packageForm,
                              user_address: e.target.value,
                            })
                          }
                          rows={2}
                          className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter delivery address"
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-4">
                  <button
                    onClick={handleLoadPackage}
                    disabled={loading}
                    className="bg-gradient-to-r from-blue-600 to-teal-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-teal-700 transition-all duration-200 disabled:opacity-50"
                  >
                    {loading ? "Loading..." : "Load Package"}
                  </button>
                </div>
              </div>

              {/* Current Packages */}
              {boxStatus && (
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3">
                    Current Packages
                  </h4>
                  <div className="space-y-3">
                    {Object.entries(boxStatus.boxes)
                      .filter(([_, box]: [string, any]) => box.occupied)
                      .map(([boxNum, box]: [string, any]) => (
                        <div
                          key={boxNum}
                          className="bg-white border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-gray-900">
                                Box {boxNum} - {box.package_id}
                              </div>
                              <div className="text-sm text-gray-600">
                                Customer: {box.user_name} ({box.user_email})
                              </div>
                              <div className="text-sm text-gray-600">
                                Address: {box.user_address}
                              </div>
                              <div className="flex items-center space-x-2 mt-1">
                                {box.unlocked ? (
                                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                    Unlocked
                                  </span>
                                ) : (
                                  <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                                    Locked
                                  </span>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() =>
                                handleUnloadPackage(parseInt(boxNum))
                              }
                              disabled={loading}
                              className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                            >
                              Unload
                            </button>
                          </div>
                        </div>
                      ))}

                    {Object.values(boxStatus.boxes).every(
                      (box: any) => !box.occupied
                    ) && (
                      <div className="text-center py-8 text-gray-500">
                        No packages currently loaded
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">
                User Management
              </h3>

              <div className="space-y-3">
                {users.map((user) => (
                  <div
                    key={user.email}
                    className="bg-white border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {user.email}
                        </div>
                        <div className="text-sm text-gray-600">
                          {user.address}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === "admin"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {user.role}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {users.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No users found
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Load Robot Tab */}
          {activeTab === "load-robot" && <LoadRobotPage />}

          {/* Robot Tracking Tab */}
          {activeTab === "tracking" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Robot Location Tracking
              </h3>
              <RobotLocationTracker
                autoStart={true}
                updateInterval={3000}
                showControls={true}
                compact={false}
              />
            </div>
          )}

          {/* System Status Tab */}
          {activeTab === "system" && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">
                System Status
              </h3>

              {systemStatus && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Cpu className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">
                        CPU Usage
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-blue-900">
                      {systemStatus.cpu_usage?.toFixed(1) || "N/A"}%
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <HardDrive className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-green-900">
                        Memory
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-green-900">
                      {systemStatus.memory_usage?.toFixed(1) || "N/A"}%
                    </div>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <HardDrive className="w-5 h-5 text-orange-600" />
                      <span className="text-sm font-medium text-orange-900">
                        Disk Usage
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-orange-900">
                      {systemStatus.disk_usage?.toFixed(1) || "N/A"}%
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Activity className="w-5 h-5 text-purple-600" />
                      <span className="text-sm font-medium text-purple-900">
                        Uptime
                      </span>
                    </div>
                    <div className="text-lg font-bold text-purple-900">
                      {systemStatus.uptime
                        ? `${Math.floor(systemStatus.uptime / 3600)}h`
                        : "N/A"}
                    </div>
                  </div>
                </div>
              )}

              {/* Additional System Info */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-md font-semibold text-gray-900 mb-4">
                  System Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">API Endpoint:</span>
                    <div className="font-mono text-gray-900 mt-1">
                      {process.env.NODE_ENV === "development"
                        ? "https://192.168.0.154:5000"
                        : "Production API"}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Last Updated:</span>
                    <div className="font-medium text-gray-900 mt-1">
                      {new Date().toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Box Control:</span>
                    <div className="font-medium text-green-700 mt-1">
                      ✅ Enabled
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">SSL Security:</span>
                    <div className="font-medium text-green-700 mt-1">
                      🔒 HTTPS Active
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
