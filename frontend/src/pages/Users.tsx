import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../lib/axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Pencil, Trash2, Plus } from 'lucide-react';

export default function Users() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['users', page, search],
    queryFn: async () => {
      const res = await axios.get(`/api/users?page=${page}&limit=10&search=${search}`);
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`/api/users/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  const saveMutation = useMutation({
    mutationFn: (user: any) => {
      if (user.id) return axios.put(`/api/users/${user.id}`, user);
      return axios.post('/api/users', user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsDialogOpen(false);
      setSelectedUser(null);
    },
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you sure?')) deleteMutation.mutate(id);
  };

  const handleEdit = (user: any) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedUser({});
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = {
      id: selectedUser?.id,
      email: form.email.value,
      firstName: form.firstName.value,
      lastName: form.lastName.value,
      roleId: form.roleId.value,
      companyId: '48723c41-5ff5-4ab5-8dec-8b741f676a97', // Replace with your actual company ID
      password: form.password?.value || 'Temp123!',
    };
    saveMutation.mutate(data);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Users</h1>
        <Button onClick={handleCreate}><Plus className="w-4 h-4 mr-2" /> Add User</Button>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Search users..."
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
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data.map((user: any) => (
                <TableRow key={user.id}>
                  <TableCell>{user.firstName} {user.lastName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role.name}</TableCell>
                  <TableCell>{user.isActive ? 'Active' : 'Inactive'}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(user)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(user.id)}>
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
            <DialogTitle>{selectedUser?.id ? 'Edit User' : 'Create User'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="hidden" name="id" value={selectedUser?.id || ''} />
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" defaultValue={selectedUser?.email || ''} required />
            </div>
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" name="firstName" defaultValue={selectedUser?.firstName || ''} required />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" name="lastName" defaultValue={selectedUser?.lastName || ''} required />
            </div>
            <div>
              <Label htmlFor="roleId">Role</Label>
              <Select name="roleId" defaultValue={selectedUser?.roleId || ''}>
                <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="c3e43c1c-4946-46dc-a5e2-9cf52c649aba">SuperAdmin</SelectItem>
                  <SelectItem value="364c3ce5-7c4c-4bac-bf89-555a66ea74b5">CompanyAdmin</SelectItem>
                  <SelectItem value="844d942f-cfa7-4ddf-8047-f9dbed524974">HR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {!selectedUser?.id && (
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" placeholder="Temp123!" />
              </div>
            )}
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

