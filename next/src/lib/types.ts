export type User = {
  id: number;
  email: string;
  name: string;
};

export type AuthResponse = {
  accessToken: string;
  user: User;
};

export type Trip = {
  id: number;
  userId: number;
  title: string;
  startDate: string;
  endDate: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Place = {
  id: number;
  tripId: number;
  name: string;
  address?: string | null;
  lat?: string | null;
  lng?: string | null;
  visitAt?: string | null;
  dayOrder: number;
  memo?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ExpenseCategory =
  | "transport"
  | "food"
  | "lodging"
  | "shopping"
  | "activity"
  | "other";

export type Expense = {
  id: number;
  tripId: number;
  placeId?: number | null;
  amount: string;
  currency: string;
  category: ExpenseCategory;
  description?: string | null;
  paidAt: string;
  createdAt: string;
  updatedAt: string;
};

export type Photo = {
  id: number;
  tripId: number;
  placeId?: number | null;
  filePath: string;
  originalName: string;
  mimeType: string;
  size: number;
  caption?: string | null;
  takenAt?: string | null;
  createdAt: string;
};
