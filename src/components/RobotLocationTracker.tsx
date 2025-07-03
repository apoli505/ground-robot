import React, { useState } from "react";
import {
  MapPin,
  Battery,
  Activity,
  Play,
  Square,
  RefreshCw,
  Navigation,
  Clock,
  Wifi,
  WifiOff,
  AlertTriangle,
  Gamepad2,
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useRobotTracking } from "../hooks/useRobotTracking";

interface RobotLocationTrackerProps {
  autoStart?: boolean;
  updateInterval?: number;
  showControls?: boolean;
  compact?: boolean;
}

// Custom marker icon
const robotIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/4712/4712038.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const RobotMap = ({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) => (
  <div className="h-64 w-full rounded-xl overflow-hidden shadow border border-gray-200 mt-4">
    <MapContainer
      center={[latitude, longitude]}
      zoom={15}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution="© OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[latitude, longitude]} icon={robotIcon}>
        <Popup>Robot is here! 📍</Popup>
      </Marker>
    </MapContainer>
  </div>
);

export const RobotLocationTracker: React.FC<RobotLocationTrackerProps> = ({
  autoStart = false,
  updateInterval = 5000,
  showControls = true,
  compact = false,
}) => {
  const {
    location,
    system,
    isTracking,
    loading,
    error,
    lastUpdate,
    startTracking,
    stopTracking,
    refreshLocation,
    updateStatus,
    simulate,
    getStatusDisplay,
    getBatteryDisplay,
    getCoordinatesDisplay,
    getConnectionStatus,
  } = useRobotTracking(autoStart, updateInterval);

  const [simulationLoading, setSimulationLoading] = useState(false);
  const statusDisplay = getStatusDisplay();
  const batteryDisplay = getBatteryDisplay();
  const connectionStatus = getConnectionStatus();

  const handleSimulation = async (action: string, data?: any) => {
    setSimulationLoading(true);
    try {
      await simulate(action, data);
    } catch (error) {
      console.error("Simulation failed:", error);
    } finally {
      setSimulationLoading(false);
    }
  };

  const getConnectionIcon = () => {
    switch (connectionStatus.status) {
      case "connected":
        return <Wifi className="w-4 h-4 text-green-500" />;
      case "loading":
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      case "error":
        return <WifiOff className="w-4 h-4 text-red-500" />;
      case "stale":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <WifiOff className="w-4 h-4 text-gray-400" />;
    }
  };

  if (compact) {
    return (
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <MapPin className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">
                Robot Location
              </div>
              <div className="text-xs text-gray-500">
                {getCoordinatesDisplay()}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <Battery
                className="w-3 h-3"
                style={{ color: batteryDisplay.color }}
              />
              <span
                className="text-xs font-medium"
                style={{ color: batteryDisplay.color }}
              >
                {batteryDisplay.text}
              </span>
            </div>
            {getConnectionIcon()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
            <MapPin className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Robot Location Tracker
            </h3>
            <div className="flex items-center space-x-2">
              {getConnectionIcon()}
              <span className="text-sm text-gray-600">
                {connectionStatus.message}
              </span>
            </div>
          </div>
        </div>
        {showControls && (
          <div className="flex items-center space-x-2">
            <button
              onClick={refreshLocation}
              disabled={loading}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              title="Refresh location"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
            </button>
            {isTracking ? (
              <button
                onClick={stopTracking}
                className="flex items-center space-x-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
                <Square className="w-4 h-4" />
                <span className="text-sm font-medium">Stop</span>
              </button>
            ) : (
              <button
                onClick={startTracking}
                disabled={loading}
                className="flex items-center space-x-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
              >
                <Play className="w-4 h-4" />
                <span className="text-sm font-medium">Start</span>
              </button>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        </div>
      )}

      {location && (
        <div className="space-y-4">
          {/* Status + Battery */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Activity className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  Status
                </span>
              </div>
              <div
                className="text-lg font-semibold"
                style={{ color: statusDisplay.color }}
              >
                {statusDisplay.text}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Battery className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  Battery
                </span>
              </div>
              <div
                className="text-lg font-semibold"
                style={{ color: batteryDisplay.color }}
              >
                {batteryDisplay.text}
              </div>
            </div>
          </div>

          {/* Coordinates */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Navigation className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                Coordinates
              </span>
            </div>
            <div className="text-lg font-mono text-gray-900">
              {getCoordinatesDisplay()}
            </div>
            {location.accuracy && (
              <div className="text-xs text-gray-500 mt-1">
                Accuracy: ±{location.accuracy}m
              </div>
            )}
          </div>

          {/* Show Map if valid */}
          {location.latitude && location.longitude && (
            <RobotMap
              latitude={location.latitude}
              longitude={location.longitude}
            />
          )}

          {/* Additional Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            {location.current_destination && (
              <div>
                <span className="text-gray-500">Destination:</span>
                <div className="font-medium text-gray-900 mt-1">
                  {location.current_destination}
                </div>
              </div>
            )}
            {location.speed !== undefined && (
              <div>
                <span className="text-gray-500">Speed:</span>
                <div className="font-medium text-gray-900 mt-1">
                  {location.speed.toFixed(1)} km/h
                </div>
              </div>
            )}
            {location.heading !== undefined && (
              <div>
                <span className="text-gray-500">Heading:</span>
                <div className="font-medium text-gray-900 mt-1">
                  {location.heading.toFixed(0)}°
                </div>
              </div>
            )}
            {lastUpdate && (
              <div>
                <span className="text-gray-500">Last Update:</span>
                <div className="font-medium text-gray-900 mt-1 flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{lastUpdate.toLocaleTimeString()}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {!location && !loading && !error && (
        <div className="text-center py-8">
          <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            No Location Data
          </h4>
          <p className="text-gray-600 mb-4">
            Start tracking to get real-time robot location updates.
          </p>
          {showControls && (
            <button
              onClick={startTracking}
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-teal-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-teal-700 transition-all duration-200 disabled:opacity-50"
            >
              Start Tracking
            </button>
          )}
        </div>
      )}

      {showControls && location && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center space-x-2 mb-3">
            <Gamepad2 className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              Simulation Controls
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleSimulation("random")}
              disabled={simulationLoading}
              className="px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
            >
              Random Movement
            </button>
            <button
              onClick={() =>
                handleSimulation("start_delivery", {
                  destination: "Test Location",
                })
              }
              disabled={simulationLoading}
              className="px-3 py-2 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
            >
              Start Delivery
            </button>
            <button
              onClick={() => handleSimulation("return_home")}
              disabled={simulationLoading}
              className="px-3 py-2 text-sm bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors disabled:opacity-50"
            >
              Return Home
            </button>
            <button
              onClick={() => updateStatus("idle")}
              disabled={loading}
              className="px-3 py-2 text-sm bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              Set Idle
            </button>
          </div>
          {simulationLoading && (
            <div className="mt-2 text-xs text-blue-600 flex items-center space-x-1">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>Running simulation...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
