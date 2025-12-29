export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  course: string;
  batch: string;
  joinDate: string;
  status: 'active' | 'inactive';
}

export interface Course {
  id: string;
  name: string;
  description: string;
  feeAmount: number;
  duration: string;
}

export interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;
  status: 'pending' | 'received';
  paymentMode: 'cash' | 'upi' | 'bank' | 'card';
  transactionId?: string;
  paymentDate: string;
  description?: string;
}

export interface Expense {
  id: string;
  category: 'rent' | 'salaries' | 'utilities' | 'marketing' | 'supplies' | 'other';
  amount: number;
  description: string;
  paymentMode: 'cash' | 'upi' | 'bank' | 'card';
  expenseDate: string;
}

export interface AppSettings {
  passwordHash: string;
  centerName: string;
}

export type PaymentMode = 'cash' | 'upi' | 'bank' | 'card';
export type ExpenseCategory = 'rent' | 'salaries' | 'utilities' | 'marketing' | 'supplies' | 'other';

export const PAYMENT_MODES: PaymentMode[] = ['cash', 'upi', 'bank', 'card'];
export const EXPENSE_CATEGORIES: ExpenseCategory[] = ['rent', 'salaries', 'utilities', 'marketing', 'supplies', 'other'];

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  rent: 'Rent',
  salaries: 'Salaries',
  utilities: 'Utilities',
  marketing: 'Marketing',
  supplies: 'Supplies',
  other: 'Other',
};

export const PAYMENT_MODE_LABELS: Record<PaymentMode, string> = {
  cash: 'Cash',
  upi: 'UPI',
  bank: 'Bank Transfer',
  card: 'Card',
};
