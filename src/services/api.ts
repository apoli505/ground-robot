// IMPORTANT: Replace with your actual Raspberry Pi IP and make sure it's HTTPS
const API_BASE_URL = "https://192.168.0.154:5000"; // ← Your Pi's HTTPS URL

// DO NOT use relative URLs like '/api/...' - they will call your website domain
// DO NOT forget the protocol (https://)
// DO NOT add trailing slash

console.log("🌐 API Base URL:", API_BASE_URL);

// Enhanced API call function with proper URL handling and better error handling
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  // Ensure endpoint starts with /
  if (!endpoint.startsWith("/")) {
    endpoint = "/" + endpoint;
  }

  const fullUrl = API_BASE_URL + endpoint;
  console.log("📡 Making API call to:", fullUrl);

  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...options.headers,
      },
      mode: "cors",
      // Add timeout to prevent hanging requests
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      throw new Error(
        `API Error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const data = await response.json();
    console.log("✅ API response received:", data);
    return data;
  } catch (error: any) {
    console.error(`❌ API call failed for ${fullUrl}:`, error);

    // User-friendly error messages
    if (error.name === "AbortError" || error.name === "TimeoutError") {
      throw new Error(
        `Request timed out. Please check if the robot at ${API_BASE_URL} is responding.`
      );
    } else if (
      error.message.includes("Failed to fetch") ||
      error.message.includes("NetworkError") ||
      error.message.includes("ERR_NETWORK")
    ) {
      throw new Error(
        `Cannot connect to robot at ${API_BASE_URL}. Please check if the robot is online and you've accepted the SSL certificate.`
      );
    } else if (
      error.message.includes("SSL") ||
      error.message.includes("certificate") ||
      error.message.includes("CERT_")
    ) {
      throw new Error(
        `SSL certificate issue. Please visit ${API_BASE_URL} in your browser and accept the certificate.`
      );
    }

    throw error;
  }
};

// API functions with proper endpoint paths
export const getBoxStatus = async () => {
  return await apiCall("/api/boxes/status");
};

export const getSystemStatus = async () => {
  return await apiCall("/api/system/status");
};

export const getHealth = async () => {
  return await apiCall("/health");
};

// ============================================================================
// BOX CONTROL API FUNCTIONS - NEW FUNCTIONALITY
// ============================================================================

export const boxControlAPI = {
  // Open all boxes for loading with auto-lock timer
  openAllBoxes: async (
    operatorName: string,
    reason: string = "Loading packages",
    duration: number = 300 // 5 minutes default
  ) => {
    console.log(
      `🔓 Opening all boxes - Operator: ${operatorName}, Duration: ${duration}s`
    );

    return await apiCall("/api/boxes/open_all", {
      method: "POST",
      body: JSON.stringify({
        operator_name: operatorName,
        reason: reason,
        duration: duration,
      }),
    });
  },

  // Lock all boxes immediately
  lockAllBoxes: async (
    operatorName: string,
    reason: string = "Loading complete"
  ) => {
    console.log(`🔒 Locking all boxes - Operator: ${operatorName}`);

    return await apiCall("/api/boxes/lock_all", {
      method: "POST",
      body: JSON.stringify({
        operator_name: operatorName,
        reason: reason,
      }),
    });
  },

  // Open a specific box
  openSingleBox: async (
    boxNumber: number,
    operatorName: string,
    reason: string = "Loading package"
  ) => {
    if (![1, 2, 3, 4].includes(boxNumber)) {
      throw new Error("Box number must be 1, 2, 3, or 4");
    }

    console.log(`🔓 Opening Box ${boxNumber} - Operator: ${operatorName}`);

    return await apiCall(`/api/boxes/open/${boxNumber}`, {
      method: "POST",
      body: JSON.stringify({
        operator_name: operatorName,
        reason: reason,
      }),
    });
  },

  // Lock a specific box
  lockSingleBox: async (
    boxNumber: number,
    operatorName: string,
    reason: string = "Securing box"
  ) => {
    if (![1, 2, 3, 4].includes(boxNumber)) {
      throw new Error("Box number must be 1, 2, 3, or 4");
    }

    console.log(`🔒 Locking Box ${boxNumber} - Operator: ${operatorName}`);

    return await apiCall(`/api/boxes/lock/${boxNumber}`, {
      method: "POST",
      body: JSON.stringify({
        operator_name: operatorName,
        reason: reason,
      }),
    });
  },

  // Toggle a specific box (open if locked, lock if open)
  toggleBox: async (boxNumber: number, operatorName: string) => {
    if (![1, 2, 3, 4].includes(boxNumber)) {
      throw new Error("Box number must be 1, 2, 3, or 4");
    }

    console.log(`🔄 Toggling Box ${boxNumber} - Operator: ${operatorName}`);

    return await apiCall(`/api/boxes/toggle/${boxNumber}`, {
      method: "POST",
      body: JSON.stringify({
        operator_name: operatorName,
      }),
    });
  },

  // Emergency lock all boxes immediately
  emergencyLock: async (operatorName: string) => {
    console.log(`🚨 EMERGENCY LOCK activated by: ${operatorName}`);

    return await apiCall("/api/boxes/emergency_lock", {
      method: "POST",
      body: JSON.stringify({
        operator_name: operatorName,
      }),
    });
  },

  // Get detailed box status with unlock information
  getDetailedBoxStatus: async () => {
    const status = await getBoxStatus();

    // Add helper methods to the response
    if (status.boxes) {
      const totalBoxes = Object.keys(status.boxes).length;
      const occupiedBoxes = Object.values(status.boxes).filter(
        (box: any) => box.occupied
      ).length;
      const unlockedBoxes = Object.values(status.boxes).filter(
        (box: any) => box.unlocked
      ).length;

      return {
        ...status,
        summary: {
          total: totalBoxes,
          occupied: occupiedBoxes,
          available: totalBoxes - occupiedBoxes,
          unlocked: unlockedBoxes,
          locked: totalBoxes - unlockedBoxes,
        },
      };
    }

    return status;
  },
};

// ============================================================================
// EXISTING API FUNCTIONS (unchanged)
// ============================================================================

// Robot Location Tracking API Functions
export const getRobotLocation = async () => {
  return await apiCall("/api/robot/location");
};

export const updateRobotLocation = async (locationData: {
  latitude: number;
  longitude: number;
  battery: number;
  status: string;
  speed?: number;
  heading?: number;
}) => {
  return await apiCall("/api/robot/location", {
    method: "POST",
    body: JSON.stringify(locationData),
  });
};

export const simulateMovement = async (
  targetLat: number,
  targetLng: number
) => {
  return await apiCall("/api/robot/simulate-movement", {
    method: "POST",
    body: JSON.stringify({
      target_lat: targetLat,
      target_lng: targetLng,
    }),
  });
};

export const stopMovement = async () => {
  return await apiCall("/api/robot/stop-movement", {
    method: "POST",
  });
};

// Get all registered users (excluding admins)
export const getAllUsers = async () => {
  return await apiCall("/api/users/all");
};

// Simplified user registration - only creates normal users
export const createNormalUser = async (userData: {
  email: string;
  password: string;
  name: string;
  address: string;
}) => {
  try {
    console.log("📝 Creating user:", { ...userData, password: "[HIDDEN]" });

    const result = await apiCall("/api/users/register", {
      method: "POST",
      body: JSON.stringify({
        email: userData.email,
        name: userData.name,
        address: userData.address,
        password: userData.password,
        is_admin: false, // Always false for normal users
      }),
    });

    console.log("✅ Registration result:", result);

    if (result.success) {
      console.log("✅ User created successfully");
      return {
        success: true,
        user: {
          ...result.user,
          role: "user", // Always user role
        },
        message: result.message,
      };
    } else {
      throw new Error(result.message || "Registration failed");
    }
  } catch (error: any) {
    console.error("❌ Failed to create user:", error);
    throw error;
  }
};

// Keep the old registerUser function for backward compatibility but simplify it
export const registerUser = async (userData: {
  email: string;
  password: string;
  name: string;
  address: string;
  isAdmin?: boolean; // This will be ignored
}) => {
  console.log("📝 Attempting user registration with robot API...");
  console.log("👤 User data:", { ...userData, password: "[HIDDEN]" });

  // Always create normal user regardless of isAdmin flag
  return await createNormalUser({
    email: userData.email,
    password: userData.password,
    name: userData.name,
    address: userData.address,
  });
};

// Enhanced user login with role support
export const loginUser = async (credentials: {
  email: string;
  password: string;
}) => {
  console.log("🔐 Attempting user login with robot API...");
  console.log("👤 Login attempt for:", credentials.email);

  try {
    const result = await apiCall("/api/users/login", {
      method: "POST",
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
    });

    if (result.success) {
      console.log("✅ Login successful!");
      console.log("👤 User info:", result.user);

      const userRole = result.user.role || "user";
      console.log(`🔐 User role: ${userRole}`);

      return {
        success: true,
        user: {
          id: result.user.id || result.user.email,
          email: result.user.email,
          name: result.user.name,
          address: result.user.address || "",
          role: userRole,
        },
        message: "Login successful",
      };
    } else {
      console.error("❌ Login failed:", result.message);
      throw new Error(result.message || "Invalid credentials");
    }
  } catch (error: any) {
    console.error("❌ Login API error:", error.message);
    throw error;
  }
};

// Enhanced load package function with user selection and better validation
export const loadPackageWithUser = async (packageData: any) => {
  // Ensure we have the core package data structure
  const requiredPackageData = {
    package_id: packageData.package_id,
    user_name: packageData.user_name,
    user_email: packageData.user_email,
    user_address: packageData.user_address,
    box_number: packageData.box_number,
  };

  // Validate required fields
  const required = [
    "package_id",
    "user_name",
    "user_email",
    "user_address",
    "box_number",
  ];

  for (const field of required) {
    if (!requiredPackageData[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }

  // Additional validation
  if (requiredPackageData.package_id.trim().length < 3) {
    throw new Error("Package ID must be at least 3 characters");
  }

  if (![1, 2, 3, 4].includes(requiredPackageData.box_number)) {
    throw new Error("Box number must be 1, 2, 3, or 4");
  }

  if (!isValidEmail(requiredPackageData.user_email)) {
    throw new Error("Invalid email format");
  }

  console.log("📦 Loading package:", requiredPackageData);

  return await apiCall("/api/packages/load", {
    method: "POST",
    body: JSON.stringify(requiredPackageData),
  });
};

// Alias for backward compatibility
export const loadPackage = async (packageData: any) => {
  return await loadPackageWithUser(packageData);
};

// Updated unload package function with better error handling
export const unloadPackage = async (
  boxNumber: number,
  reason: string = "Manual unload",
  operatorName: string = "Operator"
) => {
  console.log("📦 Unloading package from box:", boxNumber);

  if (![1, 2, 3, 4].includes(boxNumber)) {
    throw new Error("Box number must be 1, 2, 3, or 4");
  }

  return await apiCall("/api/packages/unload", {
    method: "POST",
    body: JSON.stringify({
      box_number: boxNumber,
      reason: reason,
      operator_name: operatorName,
    }),
  });
};

export const getUserPackages = async (email: string) => {
  if (!email || !isValidEmail(email)) {
    throw new Error("Valid email address is required");
  }
  return await apiCall(`/api/packages/user/${encodeURIComponent(email)}`);
};

export const setAvailability = async (availabilityData: any) => {
  return await apiCall("/api/availability/set", {
    method: "POST",
    body: JSON.stringify(availabilityData),
  });
};

export const getCurrentAvailability = async () => {
  return await apiCall("/api/availability/current");
};

// Search users by name or email
export const searchUsers = (users: any[], searchTerm: string) => {
  if (!searchTerm || !Array.isArray(users)) return users;

  const term = searchTerm.toLowerCase();
  return users.filter(
    (user) =>
      user.name?.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term) ||
      (user.address && user.address.toLowerCase().includes(term))
  );
};

// Validate email format
export const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Get available boxes with better error handling
export const getAvailableBoxes = async () => {
  try {
    const response = await getBoxStatus();
    if (!response.boxes) {
      console.warn("No boxes data received");
      return [];
    }

    return Object.keys(response.boxes)
      .filter((boxNum) => !response.boxes[boxNum].occupied)
      .map((boxNum) => parseInt(boxNum))
      .filter((boxNum) => !isNaN(boxNum));
  } catch (error) {
    console.error("Failed to get available boxes:", error);
    return [];
  }
};

// Find user by email with better error handling
export const findUserByEmail = async (email: string) => {
  if (!email || !isValidEmail(email)) {
    throw new Error("Valid email address is required");
  }

  try {
    const response = await getAllUsers();
    if (!response.users || !Array.isArray(response.users)) {
      console.warn("No users data received");
      return null;
    }

    return response.users.find(
      (user: any) => user.email?.toLowerCase() === email.toLowerCase()
    );
  } catch (error) {
    console.error("Failed to find user:", error);
    return null;
  }
};

// Check if user exists
export const userExists = async (email: string) => {
  try {
    const user = await findUserByEmail(email);
    return user !== null;
  } catch (error) {
    console.error("Failed to check if user exists:", error);
    return false;
  }
};

// Generate unique package ID
export const generatePackageId = (prefix: string = "PKG") => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}_${timestamp}_${random}`;
};

// Complete package loading workflow with better error handling
export const packageLoadingWorkflow = {
  // Step 1: Initialize - load users and box status
  init: async () => {
    try {
      const [usersResponse, boxesResponse] = await Promise.all([
        getAllUsers(),
        getBoxStatus(),
      ]);

      return {
        users:
          usersResponse.users?.filter((u: any) => u.role !== "admin") || [],
        boxes: boxesResponse.boxes || {},
        success: true,
      };
    } catch (error: any) {
      console.error("Failed to initialize:", error);
      return { success: false, error: error.message };
    }
  },

  // Step 2: Validate package data
  validate: (packageData: any, mode = "existing") => {
    const errors = [];

    // Package ID validation
    if (!packageData.package_id || packageData.package_id.trim().length < 3) {
      errors.push("Package ID must be at least 3 characters");
    }

    // Box number validation
    if (
      !packageData.box_number ||
      ![1, 2, 3, 4].includes(packageData.box_number)
    ) {
      errors.push("Please select a valid box (1-4)");
    }

    // User data validation
    if (mode === "existing") {
      if (!packageData.selectedUser || !packageData.selectedUser.email) {
        errors.push("Please select an existing user");
      }
    } else {
      // Manual entry validation
      if (!packageData.user_name || packageData.user_name.trim().length < 2) {
        errors.push("Customer name must be at least 2 characters");
      }

      if (!packageData.user_email || !isValidEmail(packageData.user_email)) {
        errors.push("Please enter a valid email address");
      }

      if (
        !packageData.user_address ||
        packageData.user_address.trim().length < 5
      ) {
        errors.push("Please enter a complete delivery address");
      }
    }

    return { valid: errors.length === 0, errors };
  },

  // Step 3: Load package
  load: async (formData: any, mode = "existing") => {
    try {
      console.log("🔍 Debug - Form data received:", formData);
      console.log("🔍 Debug - Mode:", mode);

      // Prepare package data based on mode
      let packageDataToSend;

      if (mode === "existing") {
        if (!formData.selectedUser) {
          throw new Error("Please select an existing user");
        }

        packageDataToSend = {
          package_id: formData.package_id,
          user_name: formData.selectedUser.name,
          user_email: formData.selectedUser.email,
          user_address: formData.selectedUser.address,
          box_number: formData.box_number,
        };
      } else {
        packageDataToSend = {
          package_id: formData.package_id,
          user_name: formData.user_name,
          user_email: formData.user_email,
          user_address: formData.user_address,
          box_number: formData.box_number,
        };
      }

      console.log("📦 Package data to send:", packageDataToSend);

      // Validate the prepared data
      const validation = packageLoadingWorkflow.validate(
        { ...packageDataToSend, selectedUser: formData.selectedUser },
        mode
      );

      if (!validation.valid) {
        throw new Error(validation.errors.join(", "));
      }

      // Load package using the core function
      const result = await loadPackageWithUser(packageDataToSend);

      return {
        success: true,
        result,
        message: `Package ${packageDataToSend.package_id} loaded successfully in Box ${packageDataToSend.box_number}`,
      };
    } catch (error: any) {
      console.error("Package loading failed:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
};

// ============================================================================
// BOX CONTROL WORKFLOW - NEW FUNCTIONALITY
// ============================================================================

export const boxControlWorkflow = {
  // Get comprehensive box status with summary
  getStatus: async () => {
    try {
      return await boxControlAPI.getDetailedBoxStatus();
    } catch (error: any) {
      console.error("Failed to get box status:", error);
      throw error;
    }
  },

  // Safe box opening workflow
  openForLoading: async (
    operatorName: string,
    duration: number = 300, // 5 minutes default
    reason: string = "Loading packages"
  ) => {
    try {
      console.log(`🔓 Starting loading workflow - ${operatorName}`);

      // Get current status first
      const status = await boxControlAPI.getDetailedBoxStatus();
      console.log("📊 Current box status:", status.summary);

      // Open all boxes
      const result = await boxControlAPI.openAllBoxes(
        operatorName,
        reason,
        duration
      );

      if (result.success) {
        console.log(
          `✅ Loading workflow started - Auto-lock in ${duration / 60} minutes`
        );

        return {
          success: true,
          message: result.message,
          duration: duration,
          opened_boxes: result.opened_boxes,
          operator: operatorName,
        };
      } else {
        throw new Error(result.message || "Failed to open boxes");
      }
    } catch (error: any) {
      console.error("❌ Loading workflow failed:", error);
      throw error;
    }
  },

  // Safe box securing workflow
  secureAfterLoading: async (
    operatorName: string,
    reason: string = "Loading complete"
  ) => {
    try {
      console.log(`🔒 Starting securing workflow - ${operatorName}`);

      // Get current status first
      const status = await boxControlAPI.getDetailedBoxStatus();
      console.log("📊 Current box status:", status.summary);

      // Lock all boxes
      const result = await boxControlAPI.lockAllBoxes(operatorName, reason);

      if (result.success) {
        console.log("✅ Securing workflow completed");

        return {
          success: true,
          message: result.message,
          locked_boxes: result.locked_boxes,
          operator: operatorName,
        };
      } else {
        throw new Error(result.message || "Failed to lock boxes");
      }
    } catch (error: any) {
      console.error("❌ Securing workflow failed:", error);
      throw error;
    }
  },

  // Emergency security workflow
  emergencySecure: async (operatorName: string) => {
    try {
      console.log(`🚨 EMERGENCY SECURE - ${operatorName}`);

      const result = await boxControlAPI.emergencyLock(operatorName);

      if (result.success) {
        console.log("🚨 EMERGENCY SECURE COMPLETED");

        return {
          success: true,
          message: "🚨 EMERGENCY LOCK ACTIVATED - All boxes secured!",
          emergency: true,
          operator: operatorName,
        };
      } else {
        throw new Error(result.message || "Emergency lock failed");
      }
    } catch (error: any) {
      console.error("❌ Emergency secure failed:", error);
      throw error;
    }
  },

  // Individual box management
  manageBox: async (
    boxNumber: number,
    action: "open" | "lock" | "toggle",
    operatorName: string,
    reason?: string
  ) => {
    try {
      let result;

      switch (action) {
        case "open":
          result = await boxControlAPI.openSingleBox(
            boxNumber,
            operatorName,
            reason || `Opening Box ${boxNumber}`
          );
          break;
        case "lock":
          result = await boxControlAPI.lockSingleBox(
            boxNumber,
            operatorName,
            reason || `Locking Box ${boxNumber}`
          );
          break;
        case "toggle":
          result = await boxControlAPI.toggleBox(boxNumber, operatorName);
          break;
        default:
          throw new Error(`Invalid action: ${action}`);
      }

      if (result.success) {
        console.log(`✅ Box ${boxNumber} ${action} successful`);
        return result;
      } else {
        throw new Error(
          result.message || `Failed to ${action} Box ${boxNumber}`
        );
      }
    } catch (error: any) {
      console.error(`❌ Box ${boxNumber} ${action} failed:`, error);
      throw error;
    }
  },
};

// Robot Location Tracking Workflow
export const robotTrackingWorkflow = {
  // Start tracking
  start: async () => {
    try {
      console.log("🚀 Initializing robot tracking...");

      // Get initial location
      const initial = await getRobotLocation();
      console.log("📍 Initial location:", initial.location);

      return { success: true, location: initial.location };
    } catch (error: any) {
      console.error("❌ Tracking initialization failed:", error);
      return { success: false, error: error.message };
    }
  },

  // Move to specific coordinates
  moveTo: async (lat: number, lng: number) => {
    try {
      console.log(`🎯 Moving to: ${lat}, ${lng}`);

      const result = await simulateMovement(lat, lng);
      console.log(`🚀 Movement started - ETA: ${result.eta_minutes} minutes`);

      return result;
    } catch (error: any) {
      console.error("❌ Movement failed:", error);
      throw error;
    }
  },

  // Update robot location manually
  updateLocation: async (locationData: {
    latitude: number;
    longitude: number;
    battery: number;
    status: string;
    speed?: number;
    heading?: number;
  }) => {
    try {
      const result = await updateRobotLocation(locationData);
      console.log("✅ Location updated:", result);
      return result;
    } catch (error: any) {
      console.error("❌ Location update failed:", error);
      throw error;
    }
  },
};

// Role-based utility functions
export const isAdmin = (user: any) => {
  return user && user.role === "admin";
};

export const isUser = (user: any) => {
  return user && user.role === "user";
};

export const requireAdmin = (user: any) => {
  if (!user) {
    throw new Error("Authentication required");
  }
  if (!isAdmin(user)) {
    throw new Error("Admin privileges required");
  }
  return true;
};

export const requireLogin = (user: any) => {
  if (!user) {
    throw new Error("Authentication required");
  }
  return true;
};

// Helper function to provide error suggestions
const getErrorSuggestion = (errorMessage: string) => {
  if (errorMessage.includes("certificate") || errorMessage.includes("SSL")) {
    return `Visit ${API_BASE_URL} in your browser and accept the SSL certificate warning.`;
  } else if (
    errorMessage.includes("connect") ||
    errorMessage.includes("NetworkError") ||
    errorMessage.includes("Failed to fetch")
  ) {
    return "Check if the robot is powered on and connected to the same network.";
  } else if (errorMessage.includes("404")) {
    return "The robot software may not be running correctly.";
  } else if (errorMessage.includes("timeout")) {
    return "The robot is taking too long to respond. Check the connection.";
  }
  return "Check the robot connection and try again.";
};

// Connection test with detailed feedback and better error handling
export const testConnection = async () => {
  try {
    console.log("🔍 Testing connection to robot...");
    console.log("📡 Robot URL:", API_BASE_URL);

    // Test basic health first
    const health = await getHealth();
    console.log("✅ Health check passed:", health);

    // Test system status
    const systemStatus = await getSystemStatus();
    console.log("✅ System status retrieved:", systemStatus);

    // Test box status
    const boxStatus = await getBoxStatus();
    console.log("✅ Box status retrieved:", boxStatus);

    // Test box control capabilities
    const detailedBoxStatus = await boxControlAPI.getDetailedBoxStatus();
    console.log("✅ Box control API accessible:", detailedBoxStatus.summary);

    return {
      success: true,
      health,
      systemStatus,
      boxStatus: detailedBoxStatus,
      message: "Successfully connected to robot with full functionality!",
    };
  } catch (error: any) {
    console.error("❌ Connection test failed:", error.message);

    return {
      success: false,
      error: error.message,
      suggestion: getErrorSuggestion(error.message),
    };
  }
};

// Quick login test function for debugging
export const quickLoginTest = async (
  email: string = "test@example.com",
  password: string = "password123"
) => {
  console.log("🧪 Quick login test...");

  try {
    const result = await loginUser({ email, password });
    console.log("✅ Quick login test successful:", result.user);
    return result;
  } catch (error: any) {
    console.error("❌ Quick login test failed:", error.message);
    throw error;
  }
};

// Test function for creating normal users
export const testCreateUser = async () => {
  try {
    const result = await createNormalUser({
      email: "test@example.com",
      name: "Test User",
      address: "123 Test Street",
      password: "password123",
    });

    console.log("✅ Success:", result);
    return result;
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    throw error;
  }
};

// Complete user workflow test with better error handling
export const testCompleteUserWorkflow = async () => {
  console.log("🔄 Testing complete user workflow...");

  const testUserData = {
    email: "workflow@test.com",
    name: "Workflow Test User",
    address: "123 Workflow St, Test City",
    password: "workflow123",
  };

  try {
    // Step 1: Register user (always as normal user)
    console.log("📝 Step 1: Registering user...");
    const registerResult = await createNormalUser(testUserData);
    console.log("✅ Registration successful");

    // Step 2: Login with same credentials
    console.log("🔐 Step 2: Testing login...");
    const loginResult = await loginUser({
      email: testUserData.email,
      password: testUserData.password,
    });
    console.log("✅ Login successful:", loginResult.user);

    // Step 3: Load a package for this user
    console.log("📦 Step 3: Loading test package...");
    const packageResult = await loadPackage({
      package_id: "TEST-" + Date.now(),
      user_name: testUserData.name,
      user_email: testUserData.email,
      user_address: testUserData.address,
      box_number: 1,
    });
    console.log("✅ Package loaded successfully");

    // Step 4: Get user packages
    console.log("📋 Step 4: Getting user packages...");
    const userPackages = await getUserPackages(testUserData.email);
    console.log("✅ User packages retrieved:", userPackages);

    console.log("🎉 Complete workflow test successful!");
    return {
      success: true,
      user: loginResult.user,
      packages: userPackages,
    };
  } catch (error: any) {
    console.error("❌ Workflow test failed:", error.message);
    throw error;
  }
};

// ============================================================================
// BOX CONTROL TESTING FUNCTIONS - NEW FUNCTIONALITY
// ============================================================================

// Test box control functionality
export const testBoxControlWorkflow = async (
  operatorName: string = "Test Operator"
) => {
  console.log("🧪 Testing box control workflow...");

  try {
    // Step 1: Get initial status
    console.log("📊 Step 1: Getting initial box status...");
    const initialStatus = await boxControlWorkflow.getStatus();
    console.log("✅ Initial status retrieved:", initialStatus.summary);

    // Step 2: Open all boxes for loading
    console.log("🔓 Step 2: Opening all boxes for loading...");
    const openResult = await boxControlWorkflow.openForLoading(
      operatorName,
      60
    ); // 1 minute for testing
    console.log("✅ Boxes opened:", openResult);

    // Step 3: Wait a moment and check status
    console.log("⏳ Step 3: Waiting 2 seconds and checking status...");
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const midStatus = await boxControlWorkflow.getStatus();
    console.log("✅ Mid-test status:", midStatus.summary);

    // Step 4: Test individual box toggle
    console.log("🔄 Step 4: Testing individual box toggle...");
    const toggleResult = await boxControlWorkflow.manageBox(
      1,
      "toggle",
      operatorName
    );
    console.log("✅ Box 1 toggled:", toggleResult);

    // Step 5: Secure all boxes
    console.log("🔒 Step 5: Securing all boxes...");
    const secureResult = await boxControlWorkflow.secureAfterLoading(
      operatorName
    );
    console.log("✅ Boxes secured:", secureResult);

    // Step 6: Final status check
    console.log("📊 Step 6: Final status check...");
    const finalStatus = await boxControlWorkflow.getStatus();
    console.log("✅ Final status:", finalStatus.summary);

    console.log("🎉 Box control workflow test successful!");
    return {
      success: true,
      initial: initialStatus.summary,
      final: finalStatus.summary,
      operator: operatorName,
    };
  } catch (error: any) {
    console.error("❌ Box control workflow test failed:", error.message);
    throw error;
  }
};

// Test emergency lock functionality
export const testEmergencyLock = async (
  operatorName: string = "Emergency Test"
) => {
  console.log("🚨 Testing emergency lock functionality...");

  try {
    // First open some boxes
    console.log("🔓 Opening boxes to test emergency lock...");
    await boxControlWorkflow.openForLoading(operatorName, 300);

    // Wait a moment
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Emergency lock
    console.log("🚨 Activating emergency lock...");
    const emergencyResult = await boxControlWorkflow.emergencySecure(
      operatorName
    );
    console.log("✅ Emergency lock successful:", emergencyResult);

    // Check final status
    const finalStatus = await boxControlWorkflow.getStatus();
    console.log("📊 Post-emergency status:", finalStatus.summary);

    return {
      success: true,
      message: "Emergency lock test completed successfully",
      finalStatus: finalStatus.summary,
    };
  } catch (error: any) {
    console.error("❌ Emergency lock test failed:", error.message);
    throw error;
  }
};

// Comprehensive system test
export const testCompleteSystemWorkflow = async () => {
  console.log("🔄 Testing complete system workflow with box control...");

  const testOperator = "System Test";
  const testUserData = {
    email: "systemtest@test.com",
    name: "System Test User",
    address: "123 System Test St",
    password: "systemtest123",
  };

  try {
    // Step 1: Connection test
    console.log("📡 Step 1: Testing connection...");
    const connectionResult = await testConnection();
    if (!connectionResult.success) {
      throw new Error("Connection test failed");
    }
    console.log("✅ Connection test passed");

    // Step 2: User workflow
    console.log("👤 Step 2: Testing user workflow...");
    const userResult = await testCompleteUserWorkflow();
    console.log("✅ User workflow test passed");

    // Step 3: Box control workflow
    console.log("📦 Step 3: Testing box control workflow...");
    const boxResult = await testBoxControlWorkflow(testOperator);
    console.log("✅ Box control workflow test passed");

    // Step 4: Load package with box opening
    console.log("🔓 Step 4: Testing integrated package loading...");

    // Open Box 2 for loading
    await boxControlWorkflow.manageBox(
      2,
      "open",
      testOperator,
      "Loading test package"
    );

    // Load a package
    const packageResult = await loadPackage({
      package_id: "SYSTEM-TEST-" + Date.now(),
      user_name: testUserData.name,
      user_email: testUserData.email,
      user_address: testUserData.address,
      box_number: 2,
    });
    console.log("✅ Package loaded with box control");

    // Secure the box
    await boxControlWorkflow.manageBox(
      2,
      "lock",
      testOperator,
      "Package loaded"
    );

    // Step 5: Final system status
    console.log("📊 Step 5: Final system status...");
    const systemStatus = await getSystemStatus();
    const boxStatus = await boxControlWorkflow.getStatus();

    console.log("🎉 Complete system workflow test successful!");
    return {
      success: true,
      connection: connectionResult.success,
      user: userResult.success,
      boxControl: boxResult.success,
      packageLoading: !!packageResult,
      systemStatus: systemStatus,
      boxStatus: boxStatus.summary,
    };
  } catch (error: any) {
    console.error("❌ Complete system workflow test failed:", error.message);
    throw error;
  }
};

// Export API base URL for components that need it
export { API_BASE_URL };
