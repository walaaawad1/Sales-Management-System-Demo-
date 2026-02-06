
export interface SaleRecord {
  id: string;
  date: string;
  amount: number;
  status: 'completed' | 'pending' | 'cancelled';
  city: string;
  customerName: string;
  isNewCustomer: boolean;
}

export interface Product {
  id: string;
  name: string;
  stock: number;
  price: number;
  soldCount: number;
  category: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  totalSpent: number;
}

export interface DashboardStats {
  totalDaily: number;
  totalWeekly: number;
  totalMonthly: number;
  orders: {
    completed: number;
    pending: number;
    cancelled: number;
  };
  revenueComparison: {
    month: string;
    current: number;
    previous: number;
  }[];
  topProducts: { name: string; percentage: number; count: number }[];
  bottomProducts: { name: string; percentage: number; count: number }[];
}
