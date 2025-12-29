import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Student, Course, Payment, Expense } from '@/types';
import { studentsAPI, coursesAPI, paymentsAPI, expensesAPI, settingsAPI, checkAPIHealth } from '@/lib/api';
import { toast } from 'sonner';

interface DataContextType {
  // Students
  students: Student[];
  addStudent: (student: Omit<Student, 'id'>) => Promise<void>;
  updateStudent: (id: string, student: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  
  // Courses
  courses: Course[];
  addCourse: (course: Omit<Course, 'id'>) => Promise<void>;
  updateCourse: (id: string, course: Partial<Course>) => Promise<void>;
  deleteCourse: (id: string) => Promise<void>;
  
  // Payments
  payments: Payment[];
  addPayment: (payment: Omit<Payment, 'id'>) => Promise<void>;
  updatePayment: (id: string, payment: Partial<Payment>) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;
  
  // Expenses
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<void>;
  updateExpense: (id: string, expense: Partial<Expense>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;

  // Settings
  centerName: string;
  setCenterName: (name: string) => void;

  // Loading state
  isLoading: boolean;
  isConnected: boolean;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Fallback sample data when API is not available
const sampleCourses: Course[] = [
  { id: 'course-1', name: 'Mathematics', description: 'Advanced mathematics for grades 9-12', feeAmount: 5000, duration: '6 months' },
  { id: 'course-2', name: 'Physics', description: 'Physics concepts and problem solving', feeAmount: 4500, duration: '6 months' },
  { id: 'course-3', name: 'Chemistry', description: 'Organic and inorganic chemistry', feeAmount: 4500, duration: '6 months' },
  { id: 'course-4', name: 'Biology', description: 'Biology for medical entrance', feeAmount: 4000, duration: '6 months' },
];

const sampleStudents: Student[] = [
  { id: 'student-1', name: 'Rahul Sharma', email: 'rahul@email.com', phone: '9876543210', course: 'Mathematics', batch: 'Morning', joinDate: '2024-01-15', status: 'active' },
  { id: 'student-2', name: 'Priya Patel', email: 'priya@email.com', phone: '9876543211', course: 'Physics', batch: 'Evening', joinDate: '2024-02-01', status: 'active' },
];

const getDateStr = (monthsAgo: number, day: number = 15) => {
  const date = new Date();
  date.setMonth(date.getMonth() - monthsAgo);
  date.setDate(day);
  return date.toISOString().split('T')[0];
};

const samplePayments: Payment[] = [
  { id: 'pay-1', studentId: 'student-1', studentName: 'Rahul Sharma', amount: 5000, status: 'received', paymentMode: 'upi', paymentDate: getDateStr(1, 5) },
  { id: 'pay-2', studentId: 'student-2', studentName: 'Priya Patel', amount: 4500, status: 'pending', paymentMode: 'cash', paymentDate: getDateStr(0, 10) },
];

const sampleExpenses: Expense[] = [
  { id: 'exp-1', category: 'rent', amount: 15000, description: 'Monthly rent', paymentMode: 'bank', expenseDate: getDateStr(0, 1) },
  { id: 'exp-2', category: 'utilities', amount: 3500, description: 'Electricity bill', paymentMode: 'upi', expenseDate: getDateStr(0, 5) },
];

export function DataProvider({ children }: { children: ReactNode }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [centerName, setCenterNameState] = useState(settingsAPI.getCenterName());
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  // Map API response to frontend types
  const mapStudent = (s: any): Student => ({
    id: s.id,
    name: s.name,
    email: s.email || '',
    phone: s.phone || '',
    course: s.course_name || s.course || '',
    batch: s.batch || 'Morning',
    joinDate: s.enrollment_date || s.joinDate || new Date().toISOString().split('T')[0],
    status: s.status || 'active',
  });

  const mapCourse = (c: any): Course => ({
    id: c.id,
    name: c.name,
    description: c.description || '',
    feeAmount: parseFloat(c.fee) || c.feeAmount || 0,
    duration: c.duration || '',
  });

  const mapPayment = (p: any): Payment => ({
    id: p.id,
    studentId: p.student_id || p.studentId,
    studentName: p.student_name || p.studentName || '',
    amount: parseFloat(p.amount) || 0,
    status: p.status === 'completed' ? 'received' : p.status || 'pending',
    paymentMode: (p.mode || p.paymentMode || 'cash').toLowerCase() as any,
    transactionId: p.transaction_id || p.transactionId,
    paymentDate: p.date || p.paymentDate || new Date().toISOString().split('T')[0],
    description: p.description,
  });

  const mapExpense = (e: any): Expense => ({
    id: e.id,
    category: (e.category || 'other').toLowerCase() as any,
    amount: parseFloat(e.amount) || 0,
    description: e.description || '',
    paymentMode: (e.mode || e.paymentMode || 'cash').toLowerCase() as any,
    expenseDate: e.date || e.expenseDate || new Date().toISOString().split('T')[0],
  });

  // Load data from API or fallback to sample data
  const loadData = async () => {
    setIsLoading(true);
    
    const apiAvailable = await checkAPIHealth();
    setIsConnected(apiAvailable);

    if (apiAvailable) {
      try {
        const [studentsData, coursesData, paymentsData, expensesData] = await Promise.all([
          studentsAPI.getAll(),
          coursesAPI.getAll(),
          paymentsAPI.getAll(),
          expensesAPI.getAll(),
        ]);

        setStudents(studentsData.map(mapStudent));
        setCourses(coursesData.map(mapCourse));
        setPayments(paymentsData.map(mapPayment));
        setExpenses(expensesData.map(mapExpense));
        
        toast.success('Connected to backend API');
      } catch (error) {
        console.error('Failed to load data from API:', error);
        toast.error('Failed to load data from API, using sample data');
        loadSampleData();
      }
    } else {
      console.log('API not available, using sample data');
      toast.info('Backend not connected - using sample data. Start your local server at http://localhost:3001');
      loadSampleData();
    }
    
    setIsLoading(false);
  };

  const loadSampleData = () => {
    setStudents(sampleStudents);
    setCourses(sampleCourses);
    setPayments(samplePayments);
    setExpenses(sampleExpenses);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Students CRUD
  const addStudent = async (student: Omit<Student, 'id'>) => {
    if (isConnected) {
      try {
        const newStudent = await studentsAPI.create({
          name: student.name,
          email: student.email,
          phone: student.phone,
          status: student.status,
        });
        setStudents(prev => [...prev, mapStudent(newStudent)]);
        toast.success('Student added');
      } catch (error: any) {
        toast.error(error.message || 'Failed to add student');
        throw error;
      }
    } else {
      const newStudent = { ...student, id: crypto.randomUUID() };
      setStudents(prev => [...prev, newStudent]);
      toast.success('Student added (offline mode)');
    }
  };

  const updateStudent = async (id: string, student: Partial<Student>) => {
    if (isConnected) {
      try {
        const updated = await studentsAPI.update(id, student);
        setStudents(prev => prev.map(s => s.id === id ? mapStudent(updated) : s));
        toast.success('Student updated');
      } catch (error: any) {
        toast.error(error.message || 'Failed to update student');
        throw error;
      }
    } else {
      setStudents(prev => prev.map(s => s.id === id ? { ...s, ...student } : s));
      toast.success('Student updated (offline mode)');
    }
  };

  const deleteStudent = async (id: string) => {
    if (isConnected) {
      try {
        await studentsAPI.delete(id);
        setStudents(prev => prev.filter(s => s.id !== id));
        toast.success('Student deleted');
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete student');
        throw error;
      }
    } else {
      setStudents(prev => prev.filter(s => s.id !== id));
      toast.success('Student deleted (offline mode)');
    }
  };

  // Courses CRUD
  const addCourse = async (course: Omit<Course, 'id'>) => {
    if (isConnected) {
      try {
        const newCourse = await coursesAPI.create({
          name: course.name,
          fee: course.feeAmount,
          duration: course.duration,
        });
        setCourses(prev => [...prev, mapCourse(newCourse)]);
        toast.success('Course added');
      } catch (error: any) {
        toast.error(error.message || 'Failed to add course');
        throw error;
      }
    } else {
      const newCourse = { ...course, id: crypto.randomUUID() };
      setCourses(prev => [...prev, newCourse]);
      toast.success('Course added (offline mode)');
    }
  };

  const updateCourse = async (id: string, course: Partial<Course>) => {
    if (isConnected) {
      try {
        const updated = await coursesAPI.update(id, {
          name: course.name,
          fee: course.feeAmount,
          duration: course.duration,
        });
        setCourses(prev => prev.map(c => c.id === id ? mapCourse(updated) : c));
        toast.success('Course updated');
      } catch (error: any) {
        toast.error(error.message || 'Failed to update course');
        throw error;
      }
    } else {
      setCourses(prev => prev.map(c => c.id === id ? { ...c, ...course } : c));
      toast.success('Course updated (offline mode)');
    }
  };

  const deleteCourse = async (id: string) => {
    if (isConnected) {
      try {
        await coursesAPI.delete(id);
        setCourses(prev => prev.filter(c => c.id !== id));
        toast.success('Course deleted');
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete course');
        throw error;
      }
    } else {
      setCourses(prev => prev.filter(c => c.id !== id));
      toast.success('Course deleted (offline mode)');
    }
  };

  // Payments CRUD
  const addPayment = async (payment: Omit<Payment, 'id'>) => {
    if (isConnected) {
      try {
        const newPayment = await paymentsAPI.create({
          student_id: payment.studentId,
          amount: payment.amount,
          date: payment.paymentDate,
          mode: payment.paymentMode,
          status: payment.status === 'received' ? 'completed' : payment.status,
        });
        setPayments(prev => [...prev, mapPayment({ ...newPayment, student_name: payment.studentName })]);
        toast.success('Payment added');
      } catch (error: any) {
        toast.error(error.message || 'Failed to add payment');
        throw error;
      }
    } else {
      const newPayment = { ...payment, id: crypto.randomUUID() };
      setPayments(prev => [...prev, newPayment]);
      toast.success('Payment added (offline mode)');
    }
  };

  const updatePayment = async (id: string, payment: Partial<Payment>) => {
    if (isConnected) {
      try {
        const updated = await paymentsAPI.update(id, {
          amount: payment.amount,
          date: payment.paymentDate,
          mode: payment.paymentMode,
          status: payment.status === 'received' ? 'completed' : payment.status,
        });
        setPayments(prev => prev.map(p => p.id === id ? { ...p, ...mapPayment(updated) } : p));
        toast.success('Payment updated');
      } catch (error: any) {
        toast.error(error.message || 'Failed to update payment');
        throw error;
      }
    } else {
      setPayments(prev => prev.map(p => p.id === id ? { ...p, ...payment } : p));
      toast.success('Payment updated (offline mode)');
    }
  };

  const deletePayment = async (id: string) => {
    if (isConnected) {
      try {
        await paymentsAPI.delete(id);
        setPayments(prev => prev.filter(p => p.id !== id));
        toast.success('Payment deleted');
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete payment');
        throw error;
      }
    } else {
      setPayments(prev => prev.filter(p => p.id !== id));
      toast.success('Payment deleted (offline mode)');
    }
  };

  // Expenses CRUD
  const addExpense = async (expense: Omit<Expense, 'id'>) => {
    if (isConnected) {
      try {
        const newExpense = await expensesAPI.create({
          description: expense.description,
          amount: expense.amount,
          category: expense.category,
          date: expense.expenseDate,
        });
        setExpenses(prev => [...prev, mapExpense(newExpense)]);
        toast.success('Expense added');
      } catch (error: any) {
        toast.error(error.message || 'Failed to add expense');
        throw error;
      }
    } else {
      const newExpense = { ...expense, id: crypto.randomUUID() };
      setExpenses(prev => [...prev, newExpense]);
      toast.success('Expense added (offline mode)');
    }
  };

  const updateExpense = async (id: string, expense: Partial<Expense>) => {
    if (isConnected) {
      try {
        const updated = await expensesAPI.update(id, {
          description: expense.description,
          amount: expense.amount,
          category: expense.category,
          date: expense.expenseDate,
        });
        setExpenses(prev => prev.map(e => e.id === id ? mapExpense(updated) : e));
        toast.success('Expense updated');
      } catch (error: any) {
        toast.error(error.message || 'Failed to update expense');
        throw error;
      }
    } else {
      setExpenses(prev => prev.map(e => e.id === id ? { ...e, ...expense } : e));
      toast.success('Expense updated (offline mode)');
    }
  };

  const deleteExpense = async (id: string) => {
    if (isConnected) {
      try {
        await expensesAPI.delete(id);
        setExpenses(prev => prev.filter(e => e.id !== id));
        toast.success('Expense deleted');
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete expense');
        throw error;
      }
    } else {
      setExpenses(prev => prev.filter(e => e.id !== id));
      toast.success('Expense deleted (offline mode)');
    }
  };

  // Settings
  const setCenterName = (name: string) => {
    setCenterNameState(name);
    settingsAPI.setCenterName(name);
  };

  const refreshData = async () => {
    await loadData();
  };

  return (
    <DataContext.Provider value={{
      students, addStudent, updateStudent, deleteStudent,
      courses, addCourse, updateCourse, deleteCourse,
      payments, addPayment, updatePayment, deletePayment,
      expenses, addExpense, updateExpense, deleteExpense,
      centerName, setCenterName,
      isLoading, isConnected, refreshData,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
