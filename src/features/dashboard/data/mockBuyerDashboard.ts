export interface DashboardPackageItem {
  id: string;
  title: string;
  coverImage: string;
  price: number;
  rating: number;
  reviewCount: number;
  badge?: string; // e.g. "Expert"
  seller: {
    id: string;
    username: string;
    avatar: string;
  };
}

export const MOCK_RECOMMENDED_PACKAGES: DashboardPackageItem[] = [];

export const MOCK_POPULAR_PACKAGES: DashboardPackageItem[] = [];

export interface DashboardOrderItem {
  id: string;
  title: string;
  coverImage: string;
  itemType: "package" | "brief";
  orderDate: string;
  dueDate: string;
  price: number;
  status: "revision" | "in_progress" | "delivered" | "completed";
}

export const MOCK_BUYER_ORDERS: DashboardOrderItem[] = [];

export interface ManageOrderItem {
  id: string;
  seller: {
    id: string;
    name: string;
    avatar: string;
    role: string;
    badge?: "Expert" | "Pro" | "Legend";
  };
  projectTitle: string;
  projectDescription: string;
  description?: string;
  dueDate: string;
  notes: string;
  price: number;
  status: "revision" | "inprogress" | "delivered" | "failed" | "pending" | "completed" | "cancelled" | "late" | "disputed";
  isCompleted?: boolean;
  starred?: boolean;
  deadline?: string;
  raw?: any;
}

export const MOCK_MANAGE_ORDERS: ManageOrderItem[] = [];
