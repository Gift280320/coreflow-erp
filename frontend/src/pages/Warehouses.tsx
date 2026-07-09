import { useState } from 'react';
import { useDebounce } from '../hooks/useDebounce';
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

export default function Warehouses() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [selectedWarehouse, setSelectedWarehouse] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['warehouses', debouncedSearch],
    queryFn: async () => {
      const res = await axios.get('/api/warehouses');
      let warehouses = res.data;
      if (debouncedSearch) {
        warehouses = warehouses.filter((w: any) =>
          w.name.toLowerCase().includes(search.toLowerCase()) ||
          (w.location && w.location.toLowerCase().includes(search.toLowerCase()))
        );
      }
      return warehouses;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`/api/warehouses/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['warehouses'] }),
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => {
      if (data.id) return axios.put(`/api/warehouses/${data.id}`, data);
      return axios.post('/api/warehouses', data);
    },
    onError: (err: any) => setError(err.response?.data?.error || err.response?.data?.message || 'Save failed'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      setIsDialogOpen(false);
      setSelectedWarehouse(null);
      setError('');
    },
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you sure?')) deleteMutation.mutate(id);
  };

  const handleEdit = (warehouse: any) => {
    setSelectedWarehouse(warehouse);
    setIsDialogOpen(true);
    setError('');
  };

  const handleCreate = () => {
    setSelectedWarehouse({});
    setIsDialogOpen(true);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const data = {
      id: selectedWarehouse?.id,
      name: form.name.value,
      location: form.location.value || null,
    };
    saveMutation.mutate(data);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Warehouses</h1>
        <Button onClick={handleCreate}><Plus className="w-4 h-4 mr-2" /> Add Warehouse</Button>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Search warehouses..."
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
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.map((warehouse: any) => (
                <TableRow key={warehouse.id}>
                  <TableCell>{warehouse.name}</TableCell>
                  <TableCell>{warehouse.location || '-'}</TableCell>
                  <TableCell>{warehouse.isActive ? 'Active' : 'Inactive'}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(warehouse)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(warehouse.id)}>
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
            <DialogTitle>{selectedWarehouse?.id ? 'Edit Warehouse' : 'Create Warehouse'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="hidden" name="id" value={selectedWarehouse?.id || ''} />
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" defaultValue={selectedWarehouse?.name || ''} required />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" defaultValue={selectedWarehouse?.location || ''} />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" disabled={saveMutation.isPending}>{saveMutation.isPending ? 'Saving...' : 'Save'}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

