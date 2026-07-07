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

export default function Departments() {
  const [search, setSearch] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['departments', search],
    queryFn: async () => {
      const res = await axios.get('/api/departments');
      let departments = res.data;
      if (search) {
        departments = departments.filter((d: any) =>
          d.name.toLowerCase().includes(search.toLowerCase()) ||
          (d.description && d.description.toLowerCase().includes(search.toLowerCase()))
        );
      }
      return departments;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`/api/departments/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['departments'] }),
  });

  const saveMutation = useMutation({
    mutationFn: (dept: any) => {
      if (dept.id) return axios.put(`/api/departments/${dept.id}`, dept);
      return axios.post('/api/departments', dept);
    },
    onError: (err: any) => {
      console.error('Save error:', err);
      setError(err.response?.data?.message || 'Save failed');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      setIsDialogOpen(false);
      setSelectedDepartment(null);
      setError('');
    },
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you sure?')) deleteMutation.mutate(id);
  };

  const handleEdit = (dept: any) => {
    setSelectedDepartment(dept);
    setIsDialogOpen(true);
    setError('');
  };

  const handleCreate = () => {
    setSelectedDepartment({});
    setIsDialogOpen(true);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const managerIdValue = form.managerId.value && form.managerId.value.trim() !== '' ? form.managerId.value : null;
    const data = {
      id: selectedDepartment?.id,
      name: form.name.value,
      description: form.description.value,
      managerId: managerIdValue,
    };
    console.log('Submitting department data:', data);
    saveMutation.mutate(data);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Departments</h1>
        <Button onClick={handleCreate}><Plus className="w-4 h-4 mr-2" /> Add Department</Button>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Search departments..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.map((dept: any) => (
                <TableRow key={dept.id}>
                  <TableCell>{dept.name}</TableCell>
                  <TableCell>{dept.description || '-'}</TableCell>
                  <TableCell>{dept.manager ? `${dept.manager.firstName} ${dept.manager.lastName}` : 'None'}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(dept)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(dept.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedDepartment?.id ? 'Edit Department' : 'Create Department'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="hidden" name="id" value={selectedDepartment?.id || ''} />
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" defaultValue={selectedDepartment?.name || ''} required />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input id="description" name="description" defaultValue={selectedDepartment?.description || ''} />
            </div>
            <div>
              <Label htmlFor="managerId">Manager ID (optional)</Label>
              <Input id="managerId" name="managerId" defaultValue={selectedDepartment?.managerId || ''} placeholder="User ID" />
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
