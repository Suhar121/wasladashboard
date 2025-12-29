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
import { Plus, Search, Edit, Trash2, CreditCard, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Payment, PAYMENT_MODES, PAYMENT_MODE_LABELS } from '@/types';
import { format, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { DateFilter } from '@/components/DateFilter';

export default function PaymentsPage() {
  const { payments, students, addPayment, updatePayment, deletePayment } = useData();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateStart, setDateStart] = useState<Date | undefined>(undefined);
  const [dateEnd, setDateEnd] = useState<Date | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [formData, setFormData] = useState<{
    studentId: string;
    studentName: string;
    amount: string;
    status: 'pending' | 'received';
    paymentMode: 'cash' | 'upi' | 'bank' | 'card';
    transactionId: string;
    paymentDate: string;
    description: string;
  }>({
    studentId: '',
    studentName: '',
    amount: '',
    status: 'pending',
    paymentMode: 'cash',
    transactionId: '',
    paymentDate: format(new Date(), 'yyyy-MM-dd'),
    description: '',
  });

  const handleDateFilterChange = (start: Date | undefined, end: Date | undefined) => {
    setDateStart(start);
    setDateEnd(end);
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    
    let matchesDate = true;
    if (dateStart && dateEnd) {
      const paymentDate = new Date(payment.paymentDate);
      matchesDate = isWithinInterval(paymentDate, { 
        start: startOfDay(dateStart), 
        end: endOfDay(dateEnd) 
      });
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const resetForm = () => {
    setFormData({
      studentId: '',
      studentName: '',
      amount: '',
      status: 'pending',
      paymentMode: 'cash',
      transactionId: '',
      paymentDate: format(new Date(), 'yyyy-MM-dd'),
      description: '',
    });
    setEditingPayment(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.studentId || !formData.amount) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const paymentData = {
      ...formData,
      amount: parseFloat(formData.amount),
    };

    if (editingPayment) {
      updatePayment(editingPayment.id, paymentData);
      toast({ title: "Payment updated successfully" });
    } else {
      addPayment(paymentData);
      toast({ title: "Payment added successfully" });
    }
    
    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (payment: Payment) => {
    setEditingPayment(payment);
    setFormData({
      studentId: payment.studentId,
      studentName: payment.studentName,
      amount: payment.amount.toString(),
      status: payment.status,
      paymentMode: payment.paymentMode,
      transactionId: payment.transactionId || '',
      paymentDate: payment.paymentDate,
      description: payment.description || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deletePayment(id);
    toast({ title: "Payment deleted successfully" });
  };

  const handleMarkReceived = (payment: Payment) => {
    updatePayment(payment.id, { status: 'received' });
    toast({ title: "Payment marked as received" });
  };

  const handleStudentSelect = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      setFormData({ 
        ...formData, 
        studentId,
        studentName: student.name,
      });
    }
  };

  const totalReceived = payments.filter(p => p.status === 'received').reduce((sum, p) => sum + p.amount, 0);
  const totalPending = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);

  const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN')}`;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
            <p className="text-muted-foreground">Track student fee payments</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Payment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingPayment ? 'Edit Payment' : 'Record Payment'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Student *</label>
                  <Select value={formData.studentId} onValueChange={handleStudentSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.name}
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <Select value={formData.status} onValueChange={(value: 'pending' | 'received') => setFormData({ ...formData, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="received">Received</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Transaction ID</label>
                  <Input
                    value={formData.transactionId}
                    onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                    placeholder="Optional reference"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <Input
                    type="date"
                    value={formData.paymentDate}
                    onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional notes"
                  />
                </div>
                <Button type="submit" className="w-full">
                  {editingPayment ? 'Update Payment' : 'Record Payment'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="bg-success/5 border-success/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-success">Total Received</p>
                  <p className="text-2xl font-bold text-success">{formatCurrency(totalReceived)}</p>
                </div>
                <div className="rounded-full bg-success/10 p-3">
                  <Check className="h-6 w-6 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-warning/5 border-warning/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-warning">Total Pending</p>
                  <p className="text-2xl font-bold text-warning">{formatCurrency(totalPending)}</p>
                </div>
                <div className="rounded-full bg-warning/10 p-3">
                  <CreditCard className="h-6 w-6 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search payments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="received">Received</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
          <DateFilter onFilterChange={handleDateFilterChange} />
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              All Payments ({filteredPayments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredPayments.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Mode</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-medium">{payment.studentName}</TableCell>
                        <TableCell className="font-semibold">{formatCurrency(payment.amount)}</TableCell>
                        <TableCell>
                          <Badge variant={payment.status === 'received' ? 'default' : 'secondary'} className={payment.status === 'received' ? 'bg-success hover:bg-success/90' : 'bg-warning hover:bg-warning/90'}>
                            {payment.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {PAYMENT_MODE_LABELS[payment.paymentMode]}
                          </Badge>
                        </TableCell>
                        <TableCell>{format(new Date(payment.paymentDate), 'MMM dd, yyyy')}</TableCell>
                        <TableCell className="text-muted-foreground">{payment.transactionId || '-'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {payment.status === 'pending' && (
                              <Button variant="ghost" size="icon" onClick={() => handleMarkReceived(payment)} title="Mark as Received">
                                <Check className="h-4 w-4 text-success" />
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(payment)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(payment.id)}>
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
                <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No payments found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
