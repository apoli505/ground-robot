import { useState, useEffect } from "react";
import { DeliveryRequest, Robot } from "../types";

const DEMO_ROBOTS: Robot[] = [
  {
    id: "R001",
    name: "Atlas",
    status: "idle",
    location: { lat: 37.7749, lng: -122.4194 },
    batteryLevel: 85,
  },
  {
    id: "R002",
    name: "Rover",
    status: "busy",
    location: { lat: 37.7849, lng: -122.4094 },
    batteryLevel: 72,
  },
  {
    id: "R003",
    name: "Scout",
    status: "idle",
    location: { lat: 37.7649, lng: -122.4294 },
    batteryLevel: 91,
  },
];

export const useDelivery = () => {
  const [deliveries, setDeliveries] = useState<DeliveryRequest[]>([]);
  const [robots, setRobots] = useState<Robot[]>(DEMO_ROBOTS);
  const [loading, setLoading] = useState(false);

  const createDelivery = async (
    request: Omit<DeliveryRequest, "id" | "status" | "createdAt">
  ): Promise<string> => {
    setLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const availableRobot = robots.find((r) => r.status === "idle");

    const newDelivery: DeliveryRequest = {
      ...request,
      id: Date.now().toString(),
      status: availableRobot ? "assigned" : "pending",
      createdAt: new Date(),
      estimatedDelivery: new Date(
        Date.now() + (request.urgency === "urgent" ? 30 : 60) * 60 * 1000
      ),
      robotId: availableRobot?.id,
    };

    setDeliveries((prev) => [...prev, newDelivery]);

    if (availableRobot) {
      setRobots((prev) =>
        prev.map((r) =>
          r.id === availableRobot.id ? { ...r, status: "busy" } : r
        )
      );

      // Simulate delivery progression
      setTimeout(() => updateDeliveryStatus(newDelivery.id, "en-route"), 3000);
      setTimeout(() => updateDeliveryStatus(newDelivery.id, "delivered"), 8000);
    }

    setLoading(false);
    return newDelivery.id;
  };

  const updateDeliveryStatus = (
    deliveryId: string,
    status: DeliveryRequest["status"]
  ) => {
    setDeliveries((prev) =>
      prev.map((d) => (d.id === deliveryId ? { ...d, status } : d))
    );

    if (status === "delivered") {
      const delivery = deliveries.find((d) => d.id === deliveryId);
      if (delivery?.robotId) {
        setRobots((prev) =>
          prev.map((r) =>
            r.id === delivery.robotId ? { ...r, status: "idle" } : r
          )
        );
      }
    }
  };

  const getDeliveryHistory = (userId: string) => {
    return deliveries.filter((d) => d.userId === userId);
  };

  return {
    deliveries,
    robots,
    loading,
    createDelivery,
    getDeliveryHistory,
  };
};
