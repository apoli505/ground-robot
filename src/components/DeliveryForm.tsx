import React, { useState } from "react";
import { Package, Clock, AlertCircle, Send } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useDelivery } from "../hooks/useDelivery";

export const DeliveryForm: React.FC = () => {
  const { user } = useAuth();
  const { createDelivery, loading } = useDelivery();

  const [packageType, setPackageType] = useState("");
  const [packageSize, setPackageSize] = useState<"small" | "medium" | "large">(
    "small"
  );
  const [urgency, setUrgency] = useState<"normal" | "urgent">("normal");
  const [instructions, setInstructions] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.isAvailable) return;

    try {
      await createDelivery({
        userId: user.id,
        packageType,
        packageSize,
        urgency,
        instructions,
      });

      setSuccess(true);
      setPackageType("");
      setInstructions("");
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to create delivery:", error);
    }
  };

  if (!user) return null;

  if (!user.isAvailable) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="text-center py-8">
          <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Availability Required
          </h3>
          <p className="text-gray-600">
            Please enable your availability to request robot deliveries.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-r from-orange-100 to-red-100 rounded-full flex items-center justify-center">
          <Package className="w-6 h-6 text-orange-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Request Delivery
          </h3>
          <p className="text-sm text-gray-600">
            Get your package delivered by robot
          </p>
        </div>
      </div>

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-700 font-medium">
            🎉 Delivery request submitted! A robot will be dispatched shortly.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Package Type
          </label>
          <input
            type="text"
            value={packageType}
            onChange={(e) => setPackageType(e.target.value)}
            className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Food delivery, Documents, Electronics"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Package Size
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(["small", "medium", "large"] as const).map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setPackageSize(size)}
                className={`py-3 px-4 border rounded-lg text-center transition-all ${
                  packageSize === size
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <div className="capitalize font-medium">{size}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {size === "small" && "< 5 lbs"}
                  {size === "medium" && "5-15 lbs"}
                  {size === "large" && "15-30 lbs"}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Delivery Priority
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setUrgency("normal")}
              className={`py-3 px-4 border rounded-lg text-center transition-all ${
                urgency === "normal"
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <Clock className="w-5 h-5 mx-auto mb-1" />
              <div className="font-medium">Normal</div>
              <div className="text-xs text-gray-500">60 min</div>
            </button>
            <button
              type="button"
              onClick={() => setUrgency("urgent")}
              className={`py-3 px-4 border rounded-lg text-center transition-all ${
                urgency === "urgent"
                  ? "border-orange-500 bg-orange-50 text-orange-700"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <AlertCircle className="w-5 h-5 mx-auto mb-1" />
              <div className="font-medium">Urgent</div>
              <div className="text-xs text-gray-500">30 min</div>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Special Instructions (Optional)
          </label>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={3}
            className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Any special delivery instructions..."
          />
        </div>

        <button
          type="submit"
          disabled={loading || !packageType}
          className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-teal-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <Send className="w-5 h-5 mr-2" />
              Request Robot Delivery
            </>
          )}
        </button>
      </form>
    </div>
  );
};
