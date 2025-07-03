import React, { useState } from "react";
import { Clock, MapPin, Calendar } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { setAvailability } from "../services/api";

export const AvailabilityToggle: React.FC = () => {
  const { user, updateAvailability } = useAuth();
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!user) return null;

  const handleToggle = async () => {
    if (!user.isAvailable) {
      // If turning on availability, validate times and send API request
      if (!startTime || !endTime) {
        setError("Please set both start and end times");
        return;
      }

      if (startTime >= endTime) {
        setError("End time must be after start time");
        return;
      }

      setLoading(true);
      setError("");

      try {
        const data = await setAvailability({
          email: user.email,
          name: user.name,
          start_time: startTime.replace("T", " "),
          end_time: endTime.replace("T", " "),
        });

        updateAvailability(true);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 5000);
        console.log("Availability set:", data);
      } catch (err: any) {
        setError(err.message || "Failed to set availability");
        console.error("Availability API error:", err);
      } finally {
        setLoading(false);
      }
    } else {
      // If turning off availability, just update locally
      updateAvailability(false);
      setSuccess(false);
      setError("");
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              user.isAvailable ? "bg-green-100" : "bg-gray-100"
            }`}
          >
            <Clock
              className={`w-6 h-6 ${
                user.isAvailable ? "text-green-600" : "text-gray-400"
              }`}
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Delivery Availability
            </h3>
            <p className="text-sm text-gray-600">
              {user.isAvailable
                ? "Available for deliveries"
                : "Set your availability window"}
            </p>
          </div>
        </div>

        <button
          onClick={handleToggle}
          disabled={loading}
          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 ${
            user.isAvailable ? "bg-green-500" : "bg-gray-200"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              user.isAvailable ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* Time Selection - Show when not available */}
      {!user.isAvailable && (
        <div className="mb-4 space-y-4">
          <div className="flex items-center space-x-2 text-sm text-gray-700 mb-3">
            <Calendar className="w-4 h-4" />
            <span>Set your availability window:</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date & Time
              </label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date & Time
              </label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min={startTime || new Date().toISOString().slice(0, 16)}
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
        <MapPin className="w-4 h-4" />
        <span>{user.address || "No address set"}</span>
      </div>

      {/* Status Messages */}
      {loading && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm text-blue-700">
            Connecting to rover system...
          </span>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700 font-medium">
            ✅ Availability set successfully! Check your email for the QR code.
            You're now available for robot deliveries.
          </p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700 font-medium">❌ {error}</p>
        </div>
      )}

      <div className="p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-700">
          {user.isAvailable
            ? "You are currently available for deliveries. Robots can be dispatched to your location when you request a delivery."
            : "Set your availability window above and toggle on to receive robot deliveries. You will receive a QR code via email for rover identification."}
        </p>
      </div>
    </div>
  );
};
