import { AppLayout } from '@/components/AppLayout';
import { StatCard } from '@/components/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useData } from '@/contexts/DataContext';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Clock, 
  Users,
  CreditCard,
  UserCheck,
  UserPlus,
  GraduationCap,
  Receipt,
  Banknote
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { useMemo } from 'react';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, isAfter } from 'date-fns';
import { EXPENSE_CATEGORY_LABELS, PAYMENT_MODE_LABELS } from '@/types';

const COLORS = ['hsl(221, 83%, 53%)', 'hsl(142, 76%, 36%)', 'hsl(38, 92%, 50%)', 'hsl(262, 83%, 58%)', 'hsl(0, 84%, 60%)', 'hsl(199, 89%, 48%)'];

export default function Dashboard() {
  const { students, payments, expenses, courses } = useData();

  const stats = useMemo(() => {
    const totalIncome = payments
      .filter(p => p.status === 'received')
      .reduce((sum, p) => sum + p.amount, 0);
    
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const pendingPayments = payments
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + p.amount, 0);
    const netProfit = totalIncome - totalExpenses;
    const activeStudents = students.filter(s => s.status === 'active').length;
    const totalStudents = students.length;
    const inactiveStudents = students.filter(s => s.status === 'inactive').length;
    
    // This month stats
    const thisMonthStart = startOfMonth(new Date());
    const newStudentsThisMonth = students.filter(s => 
      isAfter(new Date(s.joinDate), thisMonthStart)
    ).length;
    const thisMonthIncome = payments
      .filter(p => p.status === 'received' && isAfter(new Date(p.paymentDate), thisMonthStart))
      .reduce((sum, p) => sum + p.amount, 0);
    const thisMonthExpenses = expenses
      .filter(e => isAfter(new Date(e.expenseDate), thisMonthStart))
      .reduce((sum, e) => sum + e.amount, 0);
    
    const totalPaymentsCount = payments.length;
    const receivedPaymentsCount = payments.filter(p => p.status === 'received').length;
    const totalCourses = courses.length;

    return { 
      totalIncome, totalExpenses, pendingPayments, netProfit, activeStudents,
      totalStudents, inactiveStudents, newStudentsThisMonth, thisMonthIncome,
      thisMonthExpenses, totalPaymentsCount, receivedPaymentsCount, totalCourses
    };
  }, [students, payments, expenses, courses]);

  // Monthly data for charts
  const monthlyData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      
      const monthIncome = payments
        .filter(p => p.status === 'received' && isWithinInterval(new Date(p.paymentDate), { start: monthStart, end: monthEnd }))
        .reduce((sum, p) => sum + p.amount, 0);
      
      const monthExpenses = expenses
        .filter(e => isWithinInterval(new Date(e.expenseDate), { start: monthStart, end: monthEnd }))
        .reduce((sum, e) => sum + e.amount, 0);
      
      months.push({
        name: format(date, 'MMM'),
        income: monthIncome,
        expenses: monthExpenses,
        profit: monthIncome - monthExpenses,
      });
    }
    return months;
  }, [payments, expenses]);

  // Expense breakdown by category
  const expenseBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {};
    expenses.forEach(e => {
      breakdown[e.category] = (breakdown[e.category] || 0) + e.amount;
    });
    return Object.entries(breakdown).map(([name, value]) => ({
      name: EXPENSE_CATEGORY_LABELS[name as keyof typeof EXPENSE_CATEGORY_LABELS] || name,
      value,
    }));
  }, [expenses]);

  // Recent transactions
  const recentPayments = useMemo(() => {
    return [...payments]
      .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
      .slice(0, 5);
  }, [payments]);

  const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN')}`;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your coaching center finances</p>
        </div>

        {/* Stats Grid - Row 1 */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <StatCard
            title="Total Income"
            value={formatCurrency(stats.totalIncome)}
            icon={TrendingUp}
            iconClassName="bg-success/10 text-success"
          />
          <StatCard
            title="Total Expenses"
            value={formatCurrency(stats.totalExpenses)}
            icon={TrendingDown}
            iconClassName="bg-destructive/10 text-destructive"
          />
          <StatCard
            title="Net Profit"
            value={formatCurrency(stats.netProfit)}
            icon={Wallet}
            iconClassName={stats.netProfit >= 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}
          />
          <StatCard
            title="Pending"
            value={formatCurrency(stats.pendingPayments)}
            icon={Clock}
            iconClassName="bg-warning/10 text-warning"
          />
          <StatCard
            title="Active Students"
            value={stats.activeStudents}
            icon={UserCheck}
            iconClassName="bg-info/10 text-info"
          />
        </div>

        {/* Stats Grid - Row 2 */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <StatCard
            title="Total Students"
            value={stats.totalStudents}
            icon={Users}
            iconClassName="bg-primary/10 text-primary"
          />
          <StatCard
            title="New This Month"
            value={stats.newStudentsThisMonth}
            icon={UserPlus}
            iconClassName="bg-blue-500/10 text-blue-500"
          />
          <StatCard
            title="This Month Income"
            value={formatCurrency(stats.thisMonthIncome)}
            icon={Banknote}
            iconClassName="bg-emerald-500/10 text-emerald-500"
          />
          <StatCard
            title="This Month Expenses"
            value={formatCurrency(stats.thisMonthExpenses)}
            icon={Receipt}
            iconClassName="bg-orange-500/10 text-orange-500"
          />
          <StatCard
            title="Total Courses"
            value={stats.totalCourses}
            icon={GraduationCap}
            iconClassName="bg-purple-500/10 text-purple-500"
          />
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Cash Flow Chart */}
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>Monthly Cash Flow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" tickFormatter={(value) => `₹${(value/1000).toFixed(0)}k`} />
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                    />
                    <Line type="monotone" dataKey="income" stroke="hsl(142, 76%, 36%)" strokeWidth={2} dot={{ r: 4 }} name="Income" />
                    <Line type="monotone" dataKey="expenses" stroke="hsl(0, 84%, 60%)" strokeWidth={2} dot={{ r: 4 }} name="Expenses" />
                    <Legend />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Income vs Expenses Bar Chart */}
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>Income vs Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" tickFormatter={(value) => `₹${(value/1000).toFixed(0)}k`} />
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                    />
                    <Bar dataKey="income" fill="hsl(142, 76%, 36%)" name="Income" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expenses" fill="hsl(0, 84%, 60%)" name="Expenses" radius={[4, 4, 0, 0]} />
                    <Legend />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Expense Breakdown Pie Chart */}
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>Expense Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {expenseBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        labelLine={false}
                      >
                        {expenseBreakdown.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No expenses recorded yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Payments */}
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>Recent Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentPayments.length > 0 ? (
                  recentPayments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-primary/10 p-2">
                          <CreditCard className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{payment.studentName}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(payment.paymentDate), 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${payment.status === 'received' ? 'text-success' : 'text-warning'}`}>
                          {formatCurrency(payment.amount)}
                        </p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          payment.status === 'received' 
                            ? 'bg-success/10 text-success' 
                            : 'bg-warning/10 text-warning'
                        }`}>
                          {payment.status}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    No payments recorded yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
