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

export default function Customers() {
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['customers', search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      const res = await axios.get(`/api/customers?${params.toString()}`);
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`/api/customers/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers'] }),
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => {
      if (data.id) return axios.put(`/api/customers/${data.id}`, data);
      return axios.post('/api/customers', data);
    },
    onError: (err: any) => setError(err.response?.data?.error || err.response?.data?.message || 'Save failed'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setIsDialogOpen(false);
      setSelectedCustomer(null);
      setError('');
    },
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you sure?')) deleteMutation.mutate(id);
  };

  const handleEdit = (customer: any) => {
    setSelectedCustomer(customer);
    setIsDialogOpen(true);
    setError('');
  };

  const handleCreate = () => {
    setSelectedCustomer({});
    setIsDialogOpen(true);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = {
      id: selectedCustomer?.id,
      name: form.name.value,
      email: form.email.value || null,
      phone: form.phone.value || null,
      address: form.address.value || null,
      taxId: form.taxId.value || null,
    };
    saveMutation.mutate(data);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Customers</h1>
        <Button onClick={handleCreate}><Plus className="w-4 h-4 mr-2" /> Add Customer</Button>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Search customers..."
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
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data.map((customer: any) => (
                <TableRow key={customer.id}>
                  <TableCell>{customer.name}</TableCell>
                  <TableCell>{customer.email || '-'}</TableCell>
                  <TableCell>{customer.phone || '-'}</TableCell>
                  <TableCell>{customer.isActive ? 'Active' : 'Inactive'}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(customer)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(customer.id)}>
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
            <DialogTitle>{selectedCustomer?.id ? 'Edit Customer' : 'Create Customer'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="hidden" name="id" value={selectedCustomer?.id || ''} />
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" defaultValue={selectedCustomer?.name || ''} required />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={selectedCustomer?.email || ''} />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" defaultValue={selectedCustomer?.phone || ''} />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input id="address" name="address" defaultValue={selectedCustomer?.address || ''} />
            </div>
            <div>
              <Label htmlFor="taxId">Tax ID</Label>
              <Input id="taxId" name="taxId" defaultValue={selectedCustomer?.taxId || ''} />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" disabled={saveMutation.isPending}>{saveMutation.isPending ? 'Saving...' : 'Save'}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
