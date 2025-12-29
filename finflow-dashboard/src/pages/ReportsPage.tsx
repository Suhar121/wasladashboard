import { useMemo, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BarChart3 } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, getYear, getMonth } from 'date-fns';
import { EXPENSE_CATEGORY_LABELS } from '@/types';

const COLORS = ['hsl(221, 83%, 53%)', 'hsl(142, 76%, 36%)', 'hsl(38, 92%, 50%)', 'hsl(262, 83%, 58%)', 'hsl(0, 84%, 60%)', 'hsl(199, 89%, 48%)'];

export default function ReportsPage() {
  const { payments, expenses } = useData();
  const [period, setPeriod] = useState('6months');

  const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN')}`;

  const reportData = useMemo(() => {
    const monthsCount = period === '12months' ? 12 : period === '6months' ? 6 : 3;
    const months = [];
    
    for (let i = monthsCount - 1; i >= 0; i--) {
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
        name: format(date, 'MMM yy'),
        income: monthIncome,
        expenses: monthExpenses,
        profit: monthIncome - monthExpenses,
      });
    }
    return months;
  }, [payments, expenses, period]);

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

  const totals = useMemo(() => {
    const totalIncome = payments.filter(p => p.status === 'received').reduce((sum, p) => sum + p.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const pendingPayments = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
    return { totalIncome, totalExpenses, netProfit: totalIncome - totalExpenses, pendingPayments };
  }, [payments, expenses]);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
            <p className="text-muted-foreground">Financial summaries and analytics</p>
          </div>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="12months">Last 12 Months</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total Income</p>
              <p className="text-2xl font-bold text-success">{formatCurrency(totals.totalIncome)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total Expenses</p>
              <p className="text-2xl font-bold text-destructive">{formatCurrency(totals.totalExpenses)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Net Profit</p>
              <p className={`text-2xl font-bold ${totals.netProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
                {formatCurrency(totals.netProfit)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Pending Payments</p>
              <p className="text-2xl font-bold text-warning">{formatCurrency(totals.pendingPayments)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Monthly Profit/Loss
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportData}>
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

          <Card>
            <CardHeader>
              <CardTitle>Expense Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                {expenseBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={110}
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
        </div>

        {/* Monthly Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium">Month</th>
                    <th className="text-right py-3 px-2 font-medium">Income</th>
                    <th className="text-right py-3 px-2 font-medium">Expenses</th>
                    <th className="text-right py-3 px-2 font-medium">Profit/Loss</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((row, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-3 px-2">{row.name}</td>
                      <td className="text-right py-3 px-2 text-success">{formatCurrency(row.income)}</td>
                      <td className="text-right py-3 px-2 text-destructive">{formatCurrency(row.expenses)}</td>
                      <td className={`text-right py-3 px-2 font-medium ${row.profit >= 0 ? 'text-success' : 'text-destructive'}`}>
                        {formatCurrency(row.profit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
