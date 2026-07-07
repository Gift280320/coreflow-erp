import { useState } from 'react';
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

export default function Employees() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState('');
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

  const deleteMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`/api/employees/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees'] }),
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => {
      if (data.id) return axios.put(`/api/employees/${data.id}`, data);
      return axios.post('/api/employees', data);
    },
    onError: (err: any) => {
      console.error('Save error:', err);
      setError(err.response?.data?.message || 'Save failed');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      setIsDialogOpen(false);
      setSelectedEmployee(null);
      setError('');
    },
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you sure?')) deleteMutation.mutate(id);
  };

  const handleEdit = (employee: any) => {
    setSelectedEmployee(employee);
    setIsDialogOpen(true);
    setError('');
  };

  const handleCreate = () => {
    setSelectedEmployee(null);
    setIsDialogOpen(true);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = {
      id: selectedEmployee?.id,
      userId: form.userId.value,
      departmentId: form.departmentId.value,
      jobTitle: form.jobTitle.value,
      hireDate: form.hireDate.value,
      salary: form.salary.value ? parseFloat(form.salary.value) : null,
      status: form.status.value,
    };
    saveMutation.mutate(data);
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
                  <TableCell>{emp.user?.firstName} {emp.user?.lastName}</TableCell>
                  <TableCell>{emp.department?.name}</TableCell>
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="hidden" name="id" value={selectedEmployee?.id || ''} />
            <div>
              <Label htmlFor="userId">User (Employee)</Label>
              <select
                id="userId"
                name="userId"
                defaultValue={selectedEmployee?.userId || ''}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="">Select a user</option>
                {users?.map((user: any) => (
                  <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName} ({user.email})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="departmentId">Department</Label>
              <select
                id="departmentId"
                name="departmentId"
                defaultValue={selectedEmployee?.departmentId || ''}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="">Select a department</option>
                {departments?.map((dept: any) => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input id="jobTitle" name="jobTitle" defaultValue={selectedEmployee?.jobTitle || ''} />
            </div>
            <div>
              <Label htmlFor="hireDate">Hire Date</Label>
              <Input id="hireDate" name="hireDate" type="date" defaultValue={selectedEmployee?.hireDate ? new Date(selectedEmployee.hireDate).toISOString().split('T')[0] : ''} />
            </div>
            <div>
              <Label htmlFor="salary">Salary (optional)</Label>
              <Input id="salary" name="salary" type="number" step="0.01" defaultValue={selectedEmployee?.salary || ''} />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                defaultValue={selectedEmployee?.status || 'active'}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
