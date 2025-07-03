export interface User {
  id: string;
  email: string;
  name: string;
  isAvailable: boolean;
  address?: string;
  role: "admin" | "user";
}

export interface DeliveryRequest {
  id: string;
  userId: string;
  packageType: string;
  packageSize: "small" | "medium" | "large";
  urgency: "normal" | "urgent";
  instructions?: string;
  status: "pending" | "assigned" | "en-route" | "delivered" | "cancelled";
  createdAt: Date;
  estimatedDelivery?: Date;
  robotId?: string;
}

export interface Robot {
  id: string;
  name: string;
  status: "idle" | "busy" | "maintenance";
  location: {
    lat: number;
    lng: number;
  };
  batteryLevel: number;
}
