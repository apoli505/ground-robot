import React from "react";
import { Bot, Battery, MapPin, Activity } from "lucide-react";
import { useDelivery } from "../hooks/useDelivery";

export const RobotStatus: React.FC = () => {
  const { robots } = useDelivery();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "idle":
        return "text-green-600 bg-green-100";
      case "busy":
        return "text-blue-600 bg-blue-100";
      case "maintenance":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getBatteryColor = (level: number) => {
    if (level > 60) return "text-green-600";
    if (level > 30) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-r from-cyan-100 to-blue-100 rounded-full flex items-center justify-center">
          <Bot className="w-6 h-6 text-cyan-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Robot Fleet</h3>
          <p className="text-sm text-gray-600">
            {robots.filter((r) => r.status === "idle").length} of{" "}
            {robots.length} robots available
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {robots.map((robot) => (
          <div key={robot.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{robot.name}</h4>
                  <p className="text-sm text-gray-500">ID: {robot.id}</p>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
                  robot.status
                )}`}
              >
                {robot.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Battery
                  className={`w-4 h-4 ${getBatteryColor(robot.batteryLevel)}`}
                />
                <span className="text-sm">
                  <span
                    className={`font-medium ${getBatteryColor(
                      robot.batteryLevel
                    )}`}
                  >
                    {robot.batteryLevel}%
                  </span>
                  <span className="text-gray-500 ml-1">battery</span>
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-500">
                  {robot.location.lat.toFixed(4)},{" "}
                  {robot.location.lng.toFixed(4)}
                </span>
              </div>
            </div>

            {robot.status === "busy" && (
              <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-2">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-700">
                    Currently on delivery
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
