import { useState, useEffect, useCallback, useRef } from "react";
import {
  RobotTracker,
  getRobotLocation,
  updateRobotStatus,
  simulateRobot,
  checkRobotLocation,
  formatRobotStatus,
  getRobotStatusColor,
  getBatteryColor,
  formatCoordinates,
} from "../services/robotTracking";

interface RobotLocation {
  latitude: number;
  longitude: number;
  status: string;
  battery_level: number;
  current_destination?: string;
  accuracy?: number;
  heading?: number;
  speed?: number;
  timestamp?: string;
}

interface RobotSystem {
  uptime?: number;
  cpu_usage?: number;
  memory_usage?: number;
  disk_usage?: number;
}

export const useRobotTracking = (
  autoStart: boolean = false,
  updateInterval: number = 5000
) => {
  const [location, setLocation] = useState<RobotLocation | null>(null);
  const [system, setSystem] = useState<RobotSystem | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const trackerRef = useRef<RobotTracker | null>(null);

  // Initialize tracker
  useEffect(() => {
    trackerRef.current = new RobotTracker(updateInterval);

    // Set up location update callback
    trackerRef.current.onLocationUpdate((locationData, systemData) => {
      setLocation(locationData);
      setSystem(systemData);
      setLastUpdate(new Date());
      setError(null);
    });

    // Auto-start if requested
    if (autoStart) {
      startTracking();
    }

    // Cleanup on unmount
    return () => {
      if (trackerRef.current) {
        trackerRef.current.stopTracking();
      }
    };
  }, [autoStart, updateInterval]);

  // Start tracking
  const startTracking = useCallback(() => {
    if (trackerRef.current && !isTracking) {
      setLoading(true);
      setError(null);

      try {
        trackerRef.current.startTracking();
        setIsTracking(true);
        console.log("🔄 Robot tracking started");
      } catch (err: any) {
        setError(err.message);
        console.error("❌ Failed to start tracking:", err);
      } finally {
        setLoading(false);
      }
    }
  }, [isTracking]);

  // Stop tracking
  const stopTracking = useCallback(() => {
    if (trackerRef.current && isTracking) {
      trackerRef.current.stopTracking();
      setIsTracking(false);
      console.log("⏹️ Robot tracking stopped");
    }
  }, [isTracking]);

  // Get current location once
  const refreshLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await checkRobotLocation();
      setLocation(data.location);
      setSystem(data.system);
      setLastUpdate(new Date());
      return data;
    } catch (err: any) {
      setError(err.message);
      console.error("❌ Failed to refresh location:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update robot status
  const updateStatus = useCallback(
    async (status: string, batteryLevel?: number, destination?: string) => {
      setLoading(true);
      setError(null);

      try {
        const result = await updateRobotStatus(
          status,
          batteryLevel,
          destination
        );

        // Update local state
        if (location) {
          setLocation({
            ...location,
            status,
            ...(batteryLevel !== undefined && { battery_level: batteryLevel }),
            ...(destination !== undefined && {
              current_destination: destination,
            }),
          });
        }

        console.log(`✅ Robot status updated to: ${status}`);
        return result;
      } catch (err: any) {
        setError(err.message);
        console.error("❌ Failed to update status:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [location]
  );

  // Simulate robot actions
  const simulate = useCallback(
    async (action: string, data: any = {}) => {
      setLoading(true);
      setError(null);

      try {
        const result = await simulateRobot(action, data);
        console.log(`🎮 Simulated action: ${action}`);

        // Refresh location after simulation
        setTimeout(() => {
          refreshLocation();
        }, 1000);

        return result;
      } catch (err: any) {
        setError(err.message);
        console.error("❌ Simulation failed:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [refreshLocation]
  );

  // Helper functions for UI
  const getStatusDisplay = useCallback(() => {
    if (!location) return { text: "Unknown", color: "#6b7280" };

    return {
      text: formatRobotStatus(location.status),
      color: getRobotStatusColor(location.status),
    };
  }, [location]);

  const getBatteryDisplay = useCallback(() => {
    if (!location) return { level: 0, color: "#6b7280", text: "Unknown" };

    return {
      level: location.battery_level,
      color: getBatteryColor(location.battery_level),
      text: `${location.battery_level}%`,
    };
  }, [location]);

  const getCoordinatesDisplay = useCallback(() => {
    if (!location) return "Unknown location";

    return formatCoordinates(location.latitude, location.longitude);
  }, [location]);

  const getConnectionStatus = useCallback(() => {
    if (error) return { status: "error", message: error };
    if (loading) return { status: "loading", message: "Connecting..." };
    if (!lastUpdate)
      return { status: "disconnected", message: "Not connected" };

    const timeSinceUpdate = Date.now() - lastUpdate.getTime();
    if (timeSinceUpdate > updateInterval * 2) {
      return { status: "stale", message: "Connection may be lost" };
    }

    return { status: "connected", message: "Connected" };
  }, [error, loading, lastUpdate, updateInterval]);

  return {
    // State
    location,
    system,
    isTracking,
    loading,
    error,
    lastUpdate,

    // Actions
    startTracking,
    stopTracking,
    refreshLocation,
    updateStatus,
    simulate,

    // Helpers
    getStatusDisplay,
    getBatteryDisplay,
    getCoordinatesDisplay,
    getConnectionStatus,

    // Raw tracker reference (for advanced usage)
    tracker: trackerRef.current,
  };
};
