import React from "react";
import { MapPin, Clock, CheckCircle, Truck, Package } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useDelivery } from "../hooks/useDelivery";

export const DeliveryTracking: React.FC = () => {
  const { user } = useAuth();
  const { getDeliveryHistory } = useDelivery();

  if (!user) return null;

  const deliveries = getDeliveryHistory(user.id);
  const activeDeliveries = deliveries.filter(
    (d) => d.status !== "delivered" && d.status !== "cancelled"
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "assigned":
        return "text-blue-600 bg-blue-100";
      case "en-route":
        return "text-purple-600 bg-purple-100";
      case "delivered":
        return "text-green-600 bg-green-100";
      case "cancelled":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "assigned":
        return <Package className="w-4 h-4" />;
      case "en-route":
        return <Truck className="w-4 h-4" />;
      case "delivered":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <MapPin className="w-4 h-4" />;
    }
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending Assignment";
      case "assigned":
        return "Robot Assigned";
      case "en-route":
        return "En Route";
      case "delivered":
        return "Delivered";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  if (deliveries.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="text-center py-8">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Deliveries Yet
          </h3>
          <p className="text-gray-600">
            Your delivery history will appear here once you make your first
            request.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
          <MapPin className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Delivery Tracking
          </h3>
          <p className="text-sm text-gray-600">
            {activeDeliveries.length > 0
              ? `${activeDeliveries.length} active delivery${
                  activeDeliveries.length > 1 ? "ies" : ""
                }`
              : "Recent delivery history"}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {deliveries.slice(0, 5).map((delivery) => (
          <div
            key={delivery.id}
            className="border border-gray-200 rounded-lg p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div
                  className={`p-2 rounded-full ${getStatusColor(
                    delivery.status
                  )}`}
                >
                  {getStatusIcon(delivery.status)}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    {delivery.packageType}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {delivery.createdAt.toLocaleDateString()} at{" "}
                    {delivery.createdAt.toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  delivery.status
                )}`}
              >
                {formatStatus(delivery.status)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Size:</span>
                <span className="ml-2 capitalize">{delivery.packageSize}</span>
              </div>
              <div>
                <span className="text-gray-500">Priority:</span>
                <span className="ml-2 capitalize">{delivery.urgency}</span>
              </div>
            </div>

            {delivery.robotId && (
              <div className="mt-2 text-sm">
                <span className="text-gray-500">Robot:</span>
                <span className="ml-2 font-medium">{delivery.robotId}</span>
              </div>
            )}

            {delivery.estimatedDelivery && delivery.status !== "delivered" && (
              <div className="mt-2 text-sm">
                <span className="text-gray-500">Estimated delivery:</span>
                <span className="ml-2 font-medium">
                  {delivery.estimatedDelivery.toLocaleTimeString()}
                </span>
              </div>
            )}

            {delivery.status === "en-route" && (
              <div className="mt-3 bg-purple-50 border border-purple-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <div className="animate-pulse w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-purple-700 font-medium">
                    Robot is on the way to your location
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
