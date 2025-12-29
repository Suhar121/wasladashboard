import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useData } from '@/contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2, Receipt } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Expense, EXPENSE_CATEGORIES, EXPENSE_CATEGORY_LABELS, PAYMENT_MODES, PAYMENT_MODE_LABELS } from '@/types';
import { format, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { DateFilter } from '@/components/DateFilter';

export default function ExpensesPage() {
  const { expenses, addExpense, updateExpense, deleteExpense } = useData();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [dateStart, setDateStart] = useState<Date | undefined>(undefined);
  const [dateEnd, setDateEnd] = useState<Date | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [formData, setFormData] = useState<{
    category: 'rent' | 'salaries' | 'utilities' | 'marketing' | 'supplies' | 'other';
    amount: string;
    description: string;
    paymentMode: 'cash' | 'upi' | 'bank' | 'card';
    expenseDate: string;
  }>({
    category: 'other',
    amount: '',
    description: '',
    paymentMode: 'cash',
    expenseDate: format(new Date(), 'yyyy-MM-dd'),
  });

  const handleDateFilterChange = (start: Date | undefined, end: Date | undefined) => {
    setDateStart(start);
    setDateEnd(end);
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;
    
    let matchesDate = true;
    if (dateStart && dateEnd) {
      const expenseDate = new Date(expense.expenseDate);
      matchesDate = isWithinInterval(expenseDate, { 
        start: startOfDay(dateStart), 
        end: endOfDay(dateEnd) 
      });
    }
    
    return matchesSearch && matchesCategory && matchesDate;
  });

  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const resetForm = () => {
    setFormData({
      category: 'other',
      amount: '',
      description: '',
      paymentMode: 'cash',
      expenseDate: format(new Date(), 'yyyy-MM-dd'),
    });
    setEditingExpense(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.description) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const expenseData = {
      ...formData,
      amount: parseFloat(formData.amount),
    };

    if (editingExpense) {
      updateExpense(editingExpense.id, expenseData);
      toast({ title: "Expense updated successfully" });
    } else {
      addExpense(expenseData);
      toast({ title: "Expense added successfully" });
    }
    
    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      category: expense.category,
      amount: expense.amount.toString(),
      description: expense.description,
      paymentMode: expense.paymentMode,
      expenseDate: expense.expenseDate,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteExpense(id);
    toast({ title: "Expense deleted successfully" });
  };

  const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN')}`;

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      rent: 'bg-chart-1/10 text-chart-1 border-chart-1/20',
      salaries: 'bg-chart-2/10 text-chart-2 border-chart-2/20',
      utilities: 'bg-chart-3/10 text-chart-3 border-chart-3/20',
      marketing: 'bg-chart-4/10 text-chart-4 border-chart-4/20',
      supplies: 'bg-chart-5/10 text-chart-5 border-chart-5/20',
      other: 'bg-muted text-muted-foreground border-muted',
    };
    return colors[category] || colors.other;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
            <p className="text-muted-foreground">Track your coaching center expenses</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingExpense ? 'Edit Expense' : 'Add Expense'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category *</label>
                  <Select value={formData.category} onValueChange={(value: typeof formData.category) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPENSE_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {EXPENSE_CATEGORY_LABELS[category]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount (₹) *</label>
                  <Input
                    type="number"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description *</label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="What was this expense for?"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Payment Mode</label>
                    <Select value={formData.paymentMode} onValueChange={(value: typeof formData.paymentMode) => setFormData({ ...formData, paymentMode: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_MODES.map((mode) => (
                          <SelectItem key={mode} value={mode}>
                            {PAYMENT_MODE_LABELS[mode]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date</label>
                    <Input
                      type="date"
                      value={formData.expenseDate}
                      onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full">
                  {editingExpense ? 'Update Expense' : 'Add Expense'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary */}
        <Card className="bg-destructive/5 border-destructive/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-destructive">Total Expenses</p>
                <p className="text-2xl font-bold text-destructive">{formatCurrency(totalExpenses)}</p>
              </div>
              <div className="rounded-full bg-destructive/10 p-3">
                <Receipt className="h-6 w-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {EXPENSE_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {EXPENSE_CATEGORY_LABELS[category]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DateFilter onFilterChange={handleDateFilterChange} />
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              All Expenses ({filteredExpenses.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredExpenses.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Mode</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredExpenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell className="font-medium">{expense.description}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getCategoryColor(expense.category)}>
                            {EXPENSE_CATEGORY_LABELS[expense.category]}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold text-destructive">{formatCurrency(expense.amount)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {PAYMENT_MODE_LABELS[expense.paymentMode]}
                          </Badge>
                        </TableCell>
                        <TableCell>{format(new Date(expense.expenseDate), 'MMM dd, yyyy')}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(expense)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(expense.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No expenses found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
