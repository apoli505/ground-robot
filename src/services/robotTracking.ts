// Robot Tracking API Functions
import { apiCall, API_BASE_URL } from "./api";

// 1. Get current robot location and status
export const getRobotLocation = async () => {
  return await apiCall("/api/robot/location");
};

// 2. Update robot location (if you have GPS data)
export const updateRobotLocation = async (locationData: {
  latitude: number;
  longitude: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
  status: string;
  battery_level: number;
}) => {
  return await apiCall("/api/robot/location", {
    method: "POST",
    body: JSON.stringify({
      latitude: locationData.latitude,
      longitude: locationData.longitude,
      accuracy: locationData.accuracy,
      heading: locationData.heading,
      speed: locationData.speed,
      status: locationData.status,
      battery_level: locationData.battery_level,
    }),
  });
};

// 3. Update robot status only (without location)
export const updateRobotStatus = async (
  status: string,
  batteryLevel?: number,
  destination?: string
) => {
  return await apiCall("/api/robot/status", {
    method: "POST",
    body: JSON.stringify({
      status: status,
      battery_level: batteryLevel,
      destination: destination,
    }),
  });
};

// 4. Simulate robot movement (for testing)
export const simulateRobot = async (action: string, data: any = {}) => {
  return await apiCall("/api/robot/simulate", {
    method: "POST",
    body: JSON.stringify({
      action: action,
      ...data,
    }),
  });
};

// 5. Live tracking with automatic updates
export class RobotTracker {
  private updateInterval: number;
  private isTracking: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;
  private callbacks: Array<(location: any, system: any) => void> = [];

  constructor(updateInterval: number = 5000) {
    this.updateInterval = updateInterval;
  }

  // Start live tracking
  startTracking() {
    if (this.isTracking) return;

    this.isTracking = true;
    console.log("🔄 Starting robot tracking...");

    // Initial location fetch
    this.updateLocation();

    // Set up periodic updates
    this.intervalId = setInterval(() => {
      this.updateLocation();
    }, this.updateInterval);
  }

  // Stop live tracking
  stopTracking() {
    if (!this.isTracking) return;

    this.isTracking = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    console.log("⏹️ Stopped robot tracking");
  }

  // Add callback for location updates
  onLocationUpdate(callback: (location: any, system: any) => void) {
    this.callbacks.push(callback);
  }

  // Update location and notify callbacks
  async updateLocation() {
    try {
      const data = await getRobotLocation();

      // Call all registered callbacks
      this.callbacks.forEach((callback) => {
        try {
          callback(data.location, data.system);
        } catch (error) {
          console.error("Callback error:", error);
        }
      });
    } catch (error) {
      console.error("Failed to update robot location:", error);
    }
  }

  // Get tracking status
  getTrackingStatus() {
    return {
      isTracking: this.isTracking,
      updateInterval: this.updateInterval,
      callbackCount: this.callbacks.length,
    };
  }
}

// 6. Simple usage examples

// Example 1: Get current location once
export const checkRobotLocation = async () => {
  try {
    const data = await getRobotLocation();
    console.log("🤖 Robot location:", data.location);
    console.log(
      "📍 Coordinates:",
      data.location.latitude,
      data.location.longitude
    );
    console.log("🔋 Battery:", data.location.battery_level + "%");
    console.log("📊 Status:", data.location.status);
    return data;
  } catch (error) {
    console.error("❌ Failed to get location:", error);
    throw error;
  }
};

// Example 2: Start live tracking with callback
export const startLiveTracking = (updateInterval: number = 3000) => {
  const tracker = new RobotTracker(updateInterval);

  // Add callback to handle location updates
  tracker.onLocationUpdate((location, system) => {
    console.log("📍 Robot updated:", {
      coordinates: [location.latitude, location.longitude],
      status: location.status,
      battery: location.battery_level + "%",
      destination: location.current_destination,
    });
  });

  tracker.startTracking();

  // Return tracker so you can stop it later
  return tracker;
};

// Example 3: Simulate robot for testing
export const testRobotSimulation = async () => {
  try {
    // Simulate random movement
    await simulateRobot("random");
    console.log("🎮 Simulated random movement");

    // Simulate starting delivery
    await simulateRobot("start_delivery", {
      destination: "123 Test Street",
    });
    console.log("🚚 Simulated delivery start");

    // Check the updated location
    const location = await getRobotLocation();
    console.log("📍 New status:", location.location.status);
  } catch (error) {
    console.error("❌ Simulation failed:", error);
    throw error;
  }
};

// Example 4: Update robot status manually
export const setRobotStatus = async (status: string) => {
  try {
    const result = await updateRobotStatus(status);
    console.log(`✅ Robot status set to: ${status}`);
    return result;
  } catch (error) {
    console.error("❌ Failed to update status:", error);
    throw error;
  }
};

// 7. UI Integration helpers

// Get robot status color for UI
export const getRobotStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    idle: "#6b7280",
    dispatched: "#3b82f6",
    delivering: "#10b981",
    returning: "#f59e0b",
  };
  return colors[status] || "#6b7280";
};

// Format robot status for display
export const formatRobotStatus = (status: string) => {
  const labels: Record<string, string> = {
    idle: "🏠 At Base",
    dispatched: "🚚 En Route",
    delivering: "📦 Delivering",
    returning: "🔄 Returning",
  };
  return labels[status] || status;
};

// Get battery level color based on percentage
export const getBatteryColor = (level: number) => {
  if (level > 60) return "#10b981"; // green
  if (level > 30) return "#f59e0b"; // yellow
  return "#ef4444"; // red
};

// Format coordinates for display
export const formatCoordinates = (
  lat: number,
  lng: number,
  precision: number = 6
) => {
  return `${lat.toFixed(precision)}, ${lng.toFixed(precision)}`;
};

// Calculate distance between two coordinates (in meters)
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

// Format distance for display
export const formatDistance = (meters: number) => {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  } else {
    return `${(meters / 1000).toFixed(1)}km`;
  }
};

// Estimate travel time based on distance and speed
export const estimateTravelTime = (
  distanceMeters: number,
  speedKmh: number = 5
) => {
  const distanceKm = distanceMeters / 1000;
  const timeHours = distanceKm / speedKmh;
  const timeMinutes = Math.round(timeHours * 60);

  if (timeMinutes < 60) {
    return `${timeMinutes} min`;
  } else {
    const hours = Math.floor(timeMinutes / 60);
    const minutes = timeMinutes % 60;
    return `${hours}h ${minutes}m`;
  }
};

console.log("🤖 Robot tracking API loaded");
