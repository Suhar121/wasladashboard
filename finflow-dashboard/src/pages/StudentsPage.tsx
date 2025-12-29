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
import { Plus, Search, Edit, Trash2, Users, UserCheck, UserX, UserPlus, GraduationCap, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Student } from '@/types';
import { format, startOfMonth, isAfter } from 'date-fns';

export default function StudentsPage() {
  const { students, courses, addStudent, updateStudent, deleteStudent } = useData();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [batchFilter, setBatchFilter] = useState('all');
  const [joiningMonthFilter, setJoiningMonthFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState<Omit<Student, 'id'>>({
    name: '',
    email: '',
    phone: '',
    course: '',
    batch: '09:00 AM',
    joinDate: format(new Date(), 'yyyy-MM-dd'),
    status: 'active',
  });

  // Get unique batches from students
  const uniqueBatches = [...new Set(students.map(s => s.batch))].filter(Boolean);
  
  // Get unique joining months from students
  const uniqueJoiningMonths = [...new Set(
    students.map(s => format(new Date(s.joinDate), 'yyyy-MM'))
  )].sort().reverse();

  // KPI calculations
  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.status === 'active').length;
  const inactiveStudents = students.filter(s => s.status === 'inactive').length;
  const thisMonthStart = startOfMonth(new Date());
  const newStudentsThisMonth = students.filter(s => 
    isAfter(new Date(s.joinDate), thisMonthStart)
  ).length;
  const totalCourses = courses.length;
  const totalBatches = uniqueBatches.length;

  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.course.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCourse = courseFilter === 'all' || student.course === courseFilter;
    const matchesBatch = batchFilter === 'all' || student.batch === batchFilter;
    const matchesJoiningMonth = joiningMonthFilter === 'all' || 
      format(new Date(student.joinDate), 'yyyy-MM') === joiningMonthFilter;
    
    return matchesSearch && matchesCourse && matchesBatch && matchesJoiningMonth;
  });

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      course: '',
      batch: '09:00 AM',
      joinDate: format(new Date(), 'yyyy-MM-dd'),
      status: 'active',
    });
    setEditingStudent(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.course) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (editingStudent) {
      updateStudent(editingStudent.id, formData);
      toast({ title: "Student updated successfully" });
    } else {
      addStudent(formData);
      toast({ title: "Student added successfully" });
    }
    
    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      phone: student.phone,
      course: student.course,
      batch: student.batch,
      joinDate: student.joinDate,
      status: student.status,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteStudent(id);
    toast({ title: "Student deleted successfully" });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Students</h1>
            <p className="text-muted-foreground">Manage your coaching center students</p>
          </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalStudents}</p>
                  <p className="text-xs text-muted-foreground">Total Students</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <UserCheck className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{activeStudents}</p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <UserX className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{inactiveStudents}</p>
                  <p className="text-xs text-muted-foreground">Inactive</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <UserPlus className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{newStudentsThisMonth}</p>
                  <p className="text-xs text-muted-foreground">New This Month</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <GraduationCap className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalCourses}</p>
                  <p className="text-xs text-muted-foreground">Courses</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <Clock className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalBatches}</p>
                  <p className="text-xs text-muted-foreground">Batches</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingStudent ? 'Edit Student' : 'Add New Student'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Student name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Email address"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone *</label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Phone number"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Course *</label>
                  <Select value={formData.course} onValueChange={(value) => setFormData({ ...formData, course: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.name}>
                          {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Batch Time</label>
                    <Select value={formData.batch} onValueChange={(value) => setFormData({ ...formData, batch: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="06:00 AM">06:00 AM</SelectItem>
                        <SelectItem value="07:00 AM">07:00 AM</SelectItem>
                        <SelectItem value="08:00 AM">08:00 AM</SelectItem>
                        <SelectItem value="09:00 AM">09:00 AM</SelectItem>
                        <SelectItem value="10:00 AM">10:00 AM</SelectItem>
                        <SelectItem value="11:00 AM">11:00 AM</SelectItem>
                        <SelectItem value="12:00 PM">12:00 PM</SelectItem>
                        <SelectItem value="01:00 PM">01:00 PM</SelectItem>
                        <SelectItem value="02:00 PM">02:00 PM</SelectItem>
                        <SelectItem value="03:00 PM">03:00 PM</SelectItem>
                        <SelectItem value="04:00 PM">04:00 PM</SelectItem>
                        <SelectItem value="05:00 PM">05:00 PM</SelectItem>
                        <SelectItem value="06:00 PM">06:00 PM</SelectItem>
                        <SelectItem value="07:00 PM">07:00 PM</SelectItem>
                        <SelectItem value="08:00 PM">08:00 PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <Select value={formData.status} onValueChange={(value: 'active' | 'inactive') => setFormData({ ...formData, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Join Date</label>
                  <Input
                    type="date"
                    value={formData.joinDate}
                    onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full">
                  {editingStudent ? 'Update Student' : 'Add Student'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Course Filter */}
          <Select value={courseFilter} onValueChange={setCourseFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Courses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.name}>
                  {course.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Batch Filter */}
          <Select value={batchFilter} onValueChange={setBatchFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Batches" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Batches</SelectItem>
              {uniqueBatches.map((batch) => (
                <SelectItem key={batch} value={batch}>
                  {batch}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Joining Month Filter */}
          <Select value={joiningMonthFilter} onValueChange={setJoiningMonthFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Months" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Months</SelectItem>
              {uniqueJoiningMonths.map((month) => (
                <SelectItem key={month} value={month}>
                  {format(new Date(month + '-01'), 'MMMM yyyy')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              All Students ({filteredStudents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredStudents.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead>Join Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{student.phone}</div>
                            <div className="text-muted-foreground">{student.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>{student.course}</TableCell>
                        <TableCell>{student.batch}</TableCell>
                        <TableCell>{format(new Date(student.joinDate), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>
                          <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                            {student.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(student)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(student.id)}>
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
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No students found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
