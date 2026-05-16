export interface Category {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export interface Person {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: "expense" | "income";
  value: number;
  date: string;
  category_id: string;
  person_id: string;
  description: string | null;
  installment_group_id: string | null;
  installment_index: number | null;
  installment_total: number | null;
  created_at: string;
  categories?: { name: string } | null;
  persons?: { name: string } | null;
}

export interface AlertSubscription {
  id: string;
  user_id: string;
  email: string;
  frequency: "weekly" | "biweekly" | "monthly";
  active: boolean;
  created_at: string;
}

export interface MonthlyAggregate {
  month: string;
  type: "expense" | "income";
  total: number;
}
