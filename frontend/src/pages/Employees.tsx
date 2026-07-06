import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../lib/axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Pencil, Trash2, Plus, Search } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Schema for employee form validation
const employeeSchema = z.object({
  userId: z.string().min(1, 'User is required'),
  departmentId: z.string().min(1, 'Department is required'),
  jobTitle: z.string().min(1, 'Job title is required'),
  hireDate: z.string().min(1, 'Hire date is required'),
  salary: z.string().optional(),
  status: z.string().default('active'),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

export default function Employees() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch employees
  const { data, isLoading } = useQuery({
    queryKey: ['employees', page, search, departmentFilter, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('limit', '10');
      if (search) params.append('search', search);
      if (departmentFilter) params.append('departmentId', departmentFilter);
      if (statusFilter) params.append('status', statusFilter);
      const res = await axios.get(`/api/employees?${params.toString()}`);
      return res.data;
    },
  });

  // Fetch departments for dropdown
  const { data: departments } = useQuery({
    queryKey: ['departments-list'],
    queryFn: async () => {
      const res = await axios.get('/api/departments');
      return res.data;
    },
  });

  // Fetch users for dropdown
  const { data: users } = useQuery({
    queryKey: ['users-list'],
    queryFn: async () => {
      const res = await axios.get('/api/users?limit=1000');
      return res.data.data;
    },
  });

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`/api/employees/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees'] }),
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => {
      if (data.id) return axios.put(`/api/employees/${data.id}`, data);
      return axios.post('/api/employees', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setIsDialogOpen(false);
      setSelectedEmployee(null);
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      userId: '',
      departmentId: '',
      jobTitle: '',
      hireDate: new Date().toISOString().split('T')[0],
      salary: '',
      status: 'active',
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (selectedEmployee) {
      reset({
        userId: selectedEmployee.userId,
        departmentId: selectedEmployee.departmentId,
        jobTitle: selectedEmployee.jobTitle,
        hireDate: new Date(selectedEmployee.hireDate).toISOString().split('T')[0],
        salary: selectedEmployee.salary?.toString() || '',
        status: selectedEmployee.status,
      });
    } else {
      reset({
        userId: '',
        departmentId: '',
        jobTitle: '',
        hireDate: new Date().toISOString().split('T')[0],
        salary: '',
        status: 'active',
      });
    }
  }, [selectedEmployee, reset]);

  const onSubmit = (formData: EmployeeFormData) => {
    const payload = {
      id: selectedEmployee?.id,
      ...formData,
      salary: formData.salary ? parseFloat(formData.salary) : null,
    };
    saveMutation.mutate(payload);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure?')) deleteMutation.mutate(id);
  };

  const handleEdit = (employee: any) => {
    setSelectedEmployee(employee);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedEmployee(null);
    setIsDialogOpen(true);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Employees</h1>
        <Button onClick={handleCreate}><Plus className="w-4 h-4 mr-2" /> Add Employee</Button>
      </div>

      <div className="mb-4 flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by name or job title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          className="border rounded-md px-3 py-2"
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
        >
          <option value="">All Departments</option>
          {departments?.map((dept: any) => (
            <option key={dept.id} value={dept.id}>{dept.name}</option>
          ))}
        </select>
        <select
          className="border rounded-md px-3 py-2"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="terminated">Terminated</option>
        </select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Job Title</TableHead>
                <TableHead>Hire Date</TableHead>
                <TableHead>Salary</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data.map((emp: any) => (
                <TableRow key={emp.id}>
                  <TableCell>{emp.user.firstName} {emp.user.lastName}</TableCell>
                  <TableCell>{emp.department.name}</TableCell>
                  <TableCell>{emp.jobTitle}</TableCell>
                  <TableCell>{new Date(emp.hireDate).toLocaleDateString()}</TableCell>
                  <TableCell>{emp.salary ? `$${emp.salary.toFixed(2)}` : '-'}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      emp.status === 'active' ? 'bg-green-100 text-green-800' :
                      emp.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {emp.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(emp)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(emp.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="mt-4 flex justify-between">
        <Button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
        <span>Page {page} of {Math.ceil(data?.total / 10)}</span>
        <Button disabled={page >= Math.ceil(data?.total / 10)} onClick={() => setPage(p => p + 1)}>Next</Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedEmployee ? 'Edit Employee' : 'Create Employee'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="userId">User (Employee)</Label>
              <select
                id="userId"
                {...register('userId')}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="">Select a user</option>
                {users?.map((user: any) => (
                  <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName} ({user.email})
                  </option>
                ))}
              </select>
              {errors.userId && <p className="text-red-500 text-sm">{errors.userId.message}</p>}
            </div>

            <div>
              <Label htmlFor="departmentId">Department</Label>
              <select
                id="departmentId"
                {...register('departmentId')}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="">Select a department</option>
                {departments?.map((dept: any) => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
              {errors.departmentId && <p className="text-red-500 text-sm">{errors.departmentId.message}</p>}
            </div>

            <div>
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input id="jobTitle" {...register('jobTitle')} />
              {errors.jobTitle && <p className="text-red-500 text-sm">{errors.jobTitle.message}</p>}
            </div>

            <div>
              <Label htmlFor="hireDate">Hire Date</Label>
              <Input id="hireDate" type="date" {...register('hireDate')} />
              {errors.hireDate && <p className="text-red-500 text-sm">{errors.hireDate.message}</p>}
            </div>

            <div>
              <Label htmlFor="salary">Salary (optional)</Label>
              <Input id="salary" type="number" step="0.01" {...register('salary')} />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                {...register('status')}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>

            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
