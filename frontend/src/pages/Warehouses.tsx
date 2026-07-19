import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Card, CardContent } from '../components/ui/card';
import { Pencil, Trash2, Plus, Search } from 'lucide-react';

interface Warehouse {
  id: string;
  name: string;
  code?: string;
  location?: string;
  status: string;
}

export default function Warehouses() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    location: '',
    status: 'ACTIVE',
  });
  const [error, setError] = useState('');

  const { data: warehouses, isLoading } = useQuery({
    queryKey: ['warehouses', search],
    queryFn: async () => {
      const res = await api.get('/api/warehouses');
      return Array.isArray(res.data) ? res.data : res.data?.data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/api/warehouses', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      setIsDialogOpen(false);
      resetForm();
      setError('');
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || 'Failed to save warehouse');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await api.put(`/api/warehouses/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
      setIsDialogOpen(false);
      resetForm();
      setError('');
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || 'Failed to update warehouse');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/warehouses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.error || 'Failed to delete warehouse');
    },
  });

  const resetForm = () => {
    setFormData({ name: '', code: '', location: '', status: 'ACTIVE' });
    setEditingWarehouse(null);
  };

  const handleCreate = () => { resetForm(); setIsDialogOpen(true); setError(''); };

  const handleEdit = (wh: Warehouse) => {
    setEditingWarehouse(wh);
    setFormData({
      name: wh.name,
      code: wh.code || '',
      location: wh.location || '',
      status: wh.status || 'ACTIVE',
    });
    setIsDialogOpen(true);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const payload = {
      name: formData.name,
      code: formData.code || null,
      location: formData.location || null,
      status: formData.status,
    };
    if (editingWarehouse) {
      updateMutation.mutate({ id: editingWarehouse.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this warehouse?')) deleteMutation.mutate(id);
  };

  if (isLoading) return <div className="flex items-center justify-center h-64">Loading...</div>;

  const filtered = warehouses?.filter((wh: Warehouse) =>
    wh.name.toLowerCase().includes(search.toLowerCase()) ||
    (wh.code && wh.code.toLowerCase().includes(search.toLowerCase()))
  ) || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Warehouses</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage warehouses</p>
        </div>
        <Button onClick={handleCreate}><Plus className="w-4 h-4 mr-2" /> Add Warehouse</Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search warehouses..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((wh: Warehouse) => (
                <TableRow key={wh.id}>
                  <TableCell className="font-medium">{wh.name}</TableCell>
                  <TableCell>{wh.code || '-'}</TableCell>
                  <TableCell>{wh.location || '-'}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      wh.status === 'ACTIVE' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                      wh.status === 'INACTIVE' ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400' :
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>{wh.status}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(wh)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(wh.id)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"><Trash2 className="w-4 h-4 text-red-500" /></button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-gray-500 py-8">No warehouses found</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingWarehouse ? 'Edit Warehouse' : 'Add Warehouse'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Code</Label>
              <Input id="code" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select id="status" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full border rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
            {error && <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg">{error}</div>}
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editingWarehouse ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
